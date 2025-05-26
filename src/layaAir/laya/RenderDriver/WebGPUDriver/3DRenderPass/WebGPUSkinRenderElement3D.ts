import { SkinnedMeshRenderer } from "../../../d3/core/SkinnedMeshRenderer";
import { LayaGL } from "../../../layagl/LayaGL";
import { ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUSubUniformBuffer } from "../RenderDevice/WebGPUUniform/WebGPUSubUniformBuffer";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";


/**
 * 带骨骼的基本渲染单元
 */
export class WebGPUSkinRenderElement3D extends WebGPURenderElement3D implements ISkinRenderElement3D {

    skinnedData: Float32Array[];

    globalId: number;

    objectName: string = 'WebGPUSkinRenderElement3D';

    skinnedBuffer: WebGPUSubUniformBuffer;

    skinnedUniformMap: Map<number, UniformProperty>;

    _skinnedDataSize: number = 0;
    _skinnedBufferOffsetAlignment: number = 0;

    constructor() {
        super();
        this.globalId = WebGPUGlobal.getId(this);
        this.skinnedUniformMap = new Map();

        this.skinnedUniformMap.set(SkinnedMeshRenderer.BONES, {
            id: SkinnedMeshRenderer.BONES,
            uniformtype: ShaderDataType.Matrix4x4,
            propertyName: "u_bones",
            arrayLength: 1,
        });

        const boneCount = 24;
        let bufferLength = boneCount * 16 * Float32Array.BYTES_PER_ELEMENT;

        const engine = WebGPURenderEngine._instance;
        const alignment = engine.getDevice().limits.minUniformBufferOffsetAlignment;

        this._skinnedBufferOffsetAlignment = Math.ceil(bufferLength / alignment) * alignment;
        this._skinnedDataSize = this._skinnedBufferOffsetAlignment / Float32Array.BYTES_PER_ELEMENT;
    }

    _preUpdatePre(context: WebGPURenderContext3D): void {
        //编译着色器
        this._compileShader(context);

        // material ubo
        let subShader = this.subShader;
        let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
        if (matSubBuffer.needUpload) {
            matSubBuffer.bufferBlock.needUpload();
        }

        //sprite ubo
        if (this.renderShaderData && this.owner._commonUniformMap.length > 0) {
            let nodemap = this.owner._commonUniformMap;
            for (var i = 0, n = nodemap.length; i < n; i++) {
                let moduleName = nodemap[i];

                if (moduleName == "SkinSprite3D") {
                    continue;
                }

                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(nodemap[i]);

                let uniformBuffer = this.renderShaderData.createSubUniformBuffer(moduleName, moduleName, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
                }
            }

            // skin data
            if (this.skinnedData) {
                let uniform = this.skinnedUniformMap.get(SkinnedMeshRenderer.BONES);
                // todo number 24 
                let arrayLength = 24 * (this.skinnedData.length);

                // create buffer
                if (arrayLength != uniform.arrayLength) {
                    uniform.arrayLength = arrayLength;
                    this.skinnedBuffer?.destroy();
                    // //create subUniformBuffer
                    this.skinnedBuffer = new WebGPUSubUniformBuffer("SkinSprite3D", this.skinnedUniformMap, null);
                }

                for (let i = 0; i < this.skinnedData.length; i++) {
                    let data = this.skinnedData[i];
                    this.skinnedBuffer.descriptor.uniforms.get(SkinnedMeshRenderer.BONES).view.set(data, this._skinnedDataSize * i);
                    this.skinnedBuffer.needUpload = true;
                }

                this.skinnedBuffer.upload();
            }
        }

        //additional ubo
        if (this.owner) {
            for (let [key, value] of this.owner.additionShaderData) {
                let shaderData = value as WebGPUShaderData;
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                let uniformBuffer = shaderData.createSubUniformBuffer(key, key, unifomrMap._idata);
                if (uniformBuffer && uniformBuffer.needUpload) {
                    uniformBuffer.bufferBlock.needUpload();
                }
            }
        }

        //是否反转面片
        this._invertFrontFace = this._getInvertFront();

        return;
    }

    protected _bindGroup(context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        this.bindGroupMap.clear();
        {
            let sceneGroup = context._sceneBindGroup;
            command.setBindGroup(0, sceneGroup);
            this.bindGroupMap.set(0, sceneGroup);
        }
        {
            command.setBindGroup(1, context._cameraBindGroup);
            this.bindGroupMap.set(1, context._cameraBindGroup);
        }
        {
            let shaderResource = shaderInstance.uniformSetMap.get(3);
            let textureExitsMask = shaderInstance.uniformTextureExits.get(3);

            let bindgroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([this.subShader._owner.name], this.materialShaderData, null, shaderResource, textureExitsMask);

            command.setBindGroup(3, bindgroup);
            this.bindGroupMap.set(3, bindgroup);
        }
    }

    /**
     * 渲染
     * @param context 
     * @param command 
     * @param bundle 
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (!this.isRender) {
            return 0;
        }

        let shaders = this._shaderInstances.elements;

        for (let j: number = 0, m: number = this._shaderInstances.length; j < m; j++) {
            let shaderInstance = shaders[j];

            if (!shaderInstance.complete) {
                continue;
            }
            this._bindGroup(context, shaderInstance, command);
            {
                let resource = shaderInstance.uniformSetMap.get(2);
                let textureExitsMask = shaderInstance.uniformTextureExits.get(2);
                let shaderData = this.owner.shaderData as WebGPUShaderData;
                shaderData._cacheSubUniformBuffer(this.skinnedBuffer, "SkinSprite3D", "SkinSprite3D", this.skinnedUniformMap);

                let bindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroupByNode(resource, this.owner, textureExitsMask);
                // command.setBindGroup(2, bindgroup);
                this.bindGroupMap.set(2, bindGroup);
            }

            command.setPipeline(this._getWebGPURenderPipeline(shaderInstance, context.destRT, context));

            {
                let bindgroup = this.bindGroupMap.get(2);
                for (let i = 0; i < this.skinnedData.length; i++) {
                    let skinDataOffset = [0];
                    skinDataOffset[0] = i * this._skinnedBufferOffsetAlignment;
                    command.setBindGroup(2, bindgroup, skinDataOffset);
                    this._uploadGeometryIndex(command, i);
                }
            }


        }


        return 0;
    }

    destroy(): void {
        super.destroy();
        this.skinnedData = null;
    }
}