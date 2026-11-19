import { BaseCamera } from "../../../../d3/core/BaseCamera";
import { CameraClearFlags, CameraEventFlags, DecalMode } from "../../../../d3/core/Camera";
import type { Camera } from "../../../../d3/core/Camera";
import { RenderContext3D } from "../../../../d3/core/render/RenderContext3D";
import { CommandBuffer } from "../../../../d3/core/render/command/CommandBuffer";
import { DrawMeshCMD } from "../../../../d3/core/render/command/DrawMeshCMD";
import { DrawMeshInstancedCMD } from "../../../../d3/core/render/command/DrawMeshInstancedCMD";
import { InstanceLocation, MaterialInstancePropertyBlock } from "../../../../d3/core/render/command/MaterialInstancePropertyBlock";
import { SetRTCMD } from "../../../../d3/core/render/command/SetRenderTargetCMD";
import type { Mesh } from "../../../../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../../../../d3/resource/models/PrimitiveMesh";
import { DecalDepthCopyShaderInit } from "../../../../d3/shader/decal/DecalDepthCopyShaderInit";
import { DecalShaderInit } from "../../../../d3/shader/decal/DecalShaderInit";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Color } from "../../../../maths/Color";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector4 } from "../../../../maths/Vector4";
import { FilterMode } from "../../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../../RenderEngine/RenderEnum/RenderParams";
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../../RenderEngine/RenderEnum/WrapMode";
import type { BaseTexture } from "../../../../resource/BaseTexture";
import type { Material } from "../../../../resource/Material";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { RenderTextureMRT } from "../../../../resource/RenderTextureMRT";

import type { DecalManagerImpl } from "./DecalManagerImpl";

class DecalDrawBatch {
    material: Material;
    mirrored: boolean;
    readonly matrices: Matrix4x4[] = [];
    uv = new Float32Array(4);
    params = new Float32Array(4);
    properties: MaterialInstancePropertyBlock;

    resize(count: number): void {
        if (count * 4 > this.uv.length) {
            const length = Math.min(Math.max(count * 4, this.uv.length * 2), DrawMeshInstancedCMD.maxInstanceCount * 4);
            this.uv = new Float32Array(length);
            this.params = new Float32Array(length);
        }
        this.matrices.length = count;
    }
}

/**
 * @internal
 * @en Stores render targets and commands for one camera.
 * @zh 保存单台相机的贴花渲染目标和命令。
 */
export class DecalRenderPass {
    private static _cube: Mesh;
    private static _mirroredCube: Mesh;
    private static readonly _clear = [new Color(0, 0, 0, 1), new Color(0.5, 0.5, 0.5, 1), new Color(0, 0, 0, 1)];

    readonly beforeOpaque = new CommandBuffer("Decal DBuffer");
    readonly afterOpaque = new CommandBuffer("Decal ScreenSpace / Emission");
    private _active = false;
    requiresDepthPrepass = false;
    private readonly _batches: DecalDrawBatch[] = [];
    private readonly _matrixPool: Matrix4x4[] = [];
    private readonly _inverseVP = new Matrix4x4();
    private readonly _screen = new Vector4();
    private readonly _depthParams = new Vector4();
    private readonly _instanceUV = new Vector4();
    private readonly _instanceParams = new Vector4();
    private _dbuffer: RenderTextureMRT;
    private _depthCopy: RenderTexture;

    constructor(private _camera: Camera) {
        this.beforeOpaque._camera = this.afterOpaque._camera = _camera;
        this.beforeOpaque.context = this.afterOpaque.context = RenderContext3D._instance;
    }

    /**
     * @en Collect after onPreRender and before depth-target preparation. Off and invisible decals request no decal passes or targets.
     * @zh 在 onPreRender 后、深度目标准备前收集；关闭或不可见的贴花不申请贴花通道或目标。
     */
    collect(manager: DecalManagerImpl): void {
        this.beforeOpaque.clear();
        this.afterOpaque.clear();
        this._unbind();
        const camera = this._camera;
        this.requiresDepthPrepass = false;
        this._active = false;
        const plans = manager && camera.decalMode !== DecalMode.Off
            ? manager.collect(camera.cullingMask, camera.boundFrustum, camera.transform.position, DrawMeshInstancedCMD.maxInstanceCount)
            : null;
        const count = plans?.length ?? 0;
        let matrixIndex = 0;
        for (let index = 0; index < count; index++) {
            const plan = plans[index];
            const draw = this._batches[index] ??= new DecalDrawBatch();
            draw.material = manager.materialAt(plan.first);
            draw.mirrored = plan.mirrored;
            draw.resize(plan.count);
            let slot = plan.first;
            for (let i = 0; i < plan.count; i++, matrixIndex++) {
                const matrix = this._matrixPool[matrixIndex] ??= new Matrix4x4();
                draw.matrices[i] = matrix;
                slot = manager.copyInstance(slot, matrix.elements, draw.uv, draw.params, i * 4);
            }
        }
        this._releaseBatches(count);
        if (count === 0) {
            this._releaseTargets();
            return;
        }
        if (!LayaGL.renderEngine.getCapable(RenderCapable.RenderTextureFormat_Depth))
            throw new Error("Decals require sampleable depth textures on the active render backend.");
        if (camera.decalMode === DecalMode.DBuffer && (!LayaGL.textureContext.createMultiRenderTargetInternal
            || !LayaGL.renderEngine.getCapable(RenderCapable.MRT)
            || LayaGL.renderEngine.getParams(RenderParams.Max_Color_Attachment_Count) < 3))
            throw new Error("DecalMode.DBuffer requires three MRT color attachments on the active render backend.");
        this._active = true;
        // DBuffer and unavailable opaque depth require a prepass. DBuffer 或无法复用不透明深度时需要预通道。
        const directTarget = !camera._needInternalRenderTexture() ? camera.renderTarget : null;
        const externalMSAA = directTarget?.samples > 1;
        const externalWithoutDepth = directTarget
            && (directTarget.depthStencilFormat === RenderTargetFormat.None || directTarget.depthStencilFormat === RenderTargetFormat.STENCIL_8);
        this.requiresDepthPrepass = camera.decalMode === DecalMode.DBuffer || camera.msaa || externalMSAA || !!externalWithoutDepth;
    }

    /**
     * @en Allocate decal targets and record commands after depth targets exist, before pass assembly. GPU drawing executes later.
     * @zh 深度目标就绪后、渲染通道组装前，分配贴花目标并录制命令；GPU 绘制随后执行。
     */
    prepare(currentDepth: BaseTexture): void {
        if (!this._active) return;
        const camera = this._camera;
        const target = camera._getRenderTexture();
        if (!target) throw new Error("Decals require a camera render target. For manual Camera.render(), provide renderTarget or enableBuiltInRenderTexture.");
        const width = target.width, height = target.height;
        this._screen.setValue(0, 0, 1 / width, 1 / height);
        camera._shaderValues.getMatrix4x4(BaseCamera.VIEWPROJECTMATRIX).invert(this._inverseVP);
        // A fresh prepass does not include depth kept on the camera target.
        // 本帧预通道不包含相机目标保留的已有深度。
        const keepsTargetDepth = camera.clearFlag === CameraClearFlags.Nothing || camera.clearFlag === CameraClearFlags.ColorOnly;
        const packed = camera.decalMode === DecalMode.ScreenSpace && !this.requiresDepthPrepass && (!currentDepth || keepsTargetDepth);
        // Use the actual GPU view-projection, including the camera-target Y
        // transform. Backend shader translation already handles raster Y;
        // _screenInvertY describes texture presentation, not another NDC flip.
        // 使用包含相机目标 Y 变换的实际 GPU 视投影矩阵；Shader 转换已处理光栅 Y 方向，
        // _screenInvertY 描述纹理呈现方向，不应再据此翻转 NDC。
        this._depthParams.setValue(1, 0, packed ? 1 : 0, 1);
        let depth = currentDepth;
        if (packed) {
            if (!this._depthCopy || this._depthCopy.width !== width || this._depthCopy.height !== height) {
                this._releaseDepthCopy();
                this._depthCopy = RenderTexture.createFromPool(width, height, RenderTargetFormat.R8G8B8A8,
                    RenderTargetFormat.None, false, 1, false, false);
                this._pointClamp(this._depthCopy);
            }
            target.generateDepthTexture = true;
            this._pointClamp(target.depthStencilTexture);
            DecalDepthCopyShaderInit.init();
            // Bind raw depth only for the copy; projector draws switch to the packed texture below.
            // 仅在复制时绑定原始深度，后续投射器绘制会切换到打包后的深度纹理。
            this.afterOpaque.setShaderDataTexture(camera._shaderValues, DecalShaderInit.depthTexture, target.depthStencilTexture);
            this.afterOpaque.blitScreenQuad(target.depthStencilTexture, this._depthCopy, null, DecalDepthCopyShaderInit.shader);
            depth = this._depthCopy;
        } else this._releaseDepthCopy();
        if (!depth) throw new Error("The decal pass requires current-frame depth.");
        this._pointClamp(depth);
        const values = camera._shaderValues;
        values.setMatrix4x4(DecalShaderInit.inverseViewProjection, this._inverseVP);
        values.setVector(DecalShaderInit.projectorScreenParams, this._screen);
        values.setVector(DecalShaderInit.depthParams, this._depthParams);
        if (camera.decalMode === DecalMode.DBuffer) {
            if (!this._dbuffer || this._dbuffer.width !== width || this._dbuffer.height !== height) {
                this._releaseDBuffer();
                this._dbuffer = RenderTextureMRT.createFromPool({ width, height,
                    colorFormats: [RenderTargetFormat.R8G8B8A8, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.R8G8B8A8] });
                for (let i = 0; i < 3; i++) this._pointClamp(this._dbuffer.getColorTexture(i));
            }
            // The depth prepass executes after prepare(). Bind its result only
            // when sampling begins, never while that texture is an attachment.
            // 深度预通道在 prepare() 之后执行；仅在开始采样时绑定结果，避免同时作为写入附件。
            this.beforeOpaque.setShaderDataTexture(values, DecalShaderInit.depthTexture, depth);
            this.beforeOpaque.setRenderTarget(this._dbuffer, true, false, DecalRenderPass._clear);
            this._draw(this.beforeOpaque, DecalShaderInit.DBUFFER_SUBSHADER);
            // Camera texture bindings remain present on WebGPU even when the
            // projector shader does not sample them. Bind only after writing
            // the DBuffer to avoid attachment/sample feedback in that draw.
            // WebGPU 即使未在当前 Shader 中采样，也可能保留相机纹理绑定；
            // 因此写完 DBuffer 后再绑定，避免同次绘制读写同一附件。
            for (let i = 0; i < 3; i++)
                this.beforeOpaque.setShaderDataTexture(camera._shaderValues, DecalShaderInit.dbufferTextures[i], this._dbuffer.getColorTexture(i));
            camera._shaderValues.setVector(DecalShaderInit.dbufferScreenParams, this._screen);
            this.beforeOpaque.setShaderDefine(camera._shaderValues, DecalShaderInit.dbufferDefine, true);
            this.afterOpaque.setShaderDefine(camera._shaderValues, DecalShaderInit.dbufferDefine, false);
            this._bindSceneColor(target);
            this._draw(this.afterOpaque, DecalShaderInit.EMISSION_SUBSHADER, true);
        } else {
            this._releaseDBuffer();
            this.afterOpaque.setShaderDataTexture(values, DecalShaderInit.depthTexture, depth);
            this._bindSceneColor(target);
            this._draw(this.afterOpaque, DecalShaderInit.SCREENSPACE_SUBSHADER);
        }
        this.afterOpaque.setShaderDataTexture(values, DecalShaderInit.depthTexture, null);
        for (const id of DecalShaderInit.dbufferTextures) this.afterOpaque.setShaderDataTexture(values, id, null);
    }

    getCommands(event: CameraEventFlags): CommandBuffer {
        if (!this._active) return null;
        if (event === CameraEventFlags.BeforeForwardOpaque && this._camera.decalMode === DecalMode.DBuffer) return this.beforeOpaque;
        if (event === CameraEventFlags.BeforeSkyBox) return this.afterOpaque;
        return null;
    }

    private static _getCube(reversedWinding: boolean): Mesh {
        const cached = reversedWinding ? this._mirroredCube : this._cube;
        if (cached) return cached;

        const cube = PrimitiveMesh.createBox(1, 1, 1);
        if (reversedWinding) {
            // Reverse triangle winding to match the culling of a mirrored instance batch.
            // 反转三角形绕序，抵消镜像实例合批时的绕序翻转。
            const indices = cube.getIndices();
            for (let i = 0; i < indices.length; i += 3) {
                const second = indices[i + 1];
                indices[i + 1] = indices[i + 2];
                indices[i + 2] = second;
            }
            cube.setIndices(indices);
            this._mirroredCube = cube;
        } else {
            this._cube = cube;
        }
        cube.lock = true;
        return cube;
    }

    private _bindSceneColor(target: RenderTexture): void {
        const command = SetRTCMD.create(target, false, false, false, Color.BLACK, 1, 0, this.afterOpaque);
        // Bind the color view so other opaque attachments are preserved.
        // 绑定颜色视图，保留其它不透明通道的附件。
        command._setRenderTargetCMD.rt = target._getRenderTarget(true);
        this.afterOpaque.addCustomCMD(command);
    }

    private _draw(commands: CommandBuffer, subShader: number, emissionOnly = false): void {
        const instancing = LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance);
        for (const batch of this._batches) {
            const material = batch.material, data = material.shaderData;
            if (emissionOnly && !data.hasDefine(DecalShaderInit.emissionDefine)) continue;
            const cube = DecalRenderPass._getCube(instancing && batch.mirrored);
            if (instancing) {
                batch.properties ||= new MaterialInstancePropertyBlock();
                batch.properties.setVectorArray("a_DecalUVTransform", batch.uv, InstanceLocation.CUSTOME0);
                batch.properties.setVectorArray("a_DecalParams", batch.params, InstanceLocation.CUSTOME1);
                commands.drawMeshInstance(cube, 0, batch.matrices, material, subShader, batch.properties, batch.matrices.length);
            } else {
                for (let j = 0; j < batch.matrices.length; j++) {
                    const offset = j * 4;
                    const draw = DrawMeshCMD.create(cube, batch.matrices[j], material, 0, subShader, commands);
                    const values = draw._meshRender._baseRenderNode.shaderData;
                    this._instanceUV.setValue(batch.uv[offset], batch.uv[offset + 1], batch.uv[offset + 2], batch.uv[offset + 3]);
                    this._instanceParams.setValue(batch.params[offset], batch.params[offset + 1], batch.params[offset + 2], batch.params[offset + 3]);
                    values.setVector(DecalShaderInit.instanceUV, this._instanceUV);
                    values.setVector(DecalShaderInit.instanceParams, this._instanceParams);
                    commands.addCustomCMD(draw);
                }
            }
        }
    }

    private _pointClamp(texture: BaseTexture): void {
        texture.filterMode = FilterMode.Point;
        texture.wrapModeU = texture.wrapModeV = WrapMode.Clamp;
    }
    private _unbind(): void {
        this._camera._shaderValues.removeDefine(DecalShaderInit.dbufferDefine);
        for (const id of DecalShaderInit.dbufferTextures) this._camera._shaderValues.setTexture(id, null);
        this._camera._shaderValues.setTexture(DecalShaderInit.depthTexture, null);
    }
    private _releaseDBuffer(): void {
        if (this._dbuffer) { RenderTexture.recoverToPool(this._dbuffer); this._dbuffer = null; }
    }
    private _releaseDepthCopy(): void {
        if (this._depthCopy) { RenderTexture.recoverToPool(this._depthCopy); this._depthCopy = null; }
    }
    private _releaseTargets(): void { this._releaseDBuffer(); this._releaseDepthCopy(); }

    private _releaseBatches(count: number): void {
        for (let i = count; i < this._batches.length; i++) this._batches[i].properties?.clear();
        this._batches.length = count;
    }

    destroy(): void {
        // Camera ShaderData is disposed before the Web render process.
        // Web 渲染流程销毁时，相机 ShaderData 已释放。
        this.beforeOpaque.clear();
        this.afterOpaque.clear();
        this._releaseTargets();
        this._releaseBatches(0);
        this._matrixPool.length = 0;
    }
}

