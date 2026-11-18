import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { DecalProjector } from "laya/d3/component/DecalProjector";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D, ShaderFeatureType } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { BaseTexture } from "laya/resource/BaseTexture";
import { Material } from "laya/resource/Material";
import { RenderTexture } from "laya/resource/RenderTexture";
import { Texture } from "laya/resource/Texture";
import { FlowingWaterDecalMaterial } from "./FlowingWaterDecalMaterial";
import WaterSurface from "./FlowingWaterDecalSurface.glsl";
import PreviewVS from "./DecalInspectorPreview.vs";
import PreviewFS from "./DecalInspectorPreview.fs";

export type DecalPreviewChannel = "albedo" | "normal" | "maos";

/** Sample inspector using shared native 3D lines and 2D texture presentation.
 * 使用引擎通用 3D 线条和 2D 纹理显示的示例检查面板。 */
export class DecalInspector {
    private static readonly _shaderName = "SampleDecalInspectorWater";
    private readonly _line = new PixelLineSprite3D(17, "Selected decal volume (+Z)");
    private readonly _lineMaterial: UnlitMaterial;
    private readonly _preview = new Sprite();
    private readonly _image = new Sprite();
    private _projector: DecalProjector = null;
    private _channel: DecalPreviewChannel = "albedo";
    private _showBounds = true;
    private _showTexture = true;
    private _hasPreviewRect = false;
    private _source: BaseTexture = null;
    private _texture: Texture = null;
    private _previewScene: Scene3D = null;
    private _previewCamera: Camera = null;
    private _previewTarget: RenderTexture = null;
    private _previewMaterial: Material = null;
    private _previewMesh: ReturnType<typeof PrimitiveMesh.createQuad> = null;
    private _geometryKey = "";
    private _kind: "texture" | "procedural" | "missing" = "missing";
    private _disposed = false;

    constructor(uiRoot: Sprite) {
        this._lineMaterial = this._line.pixelLineRenderer.sharedMaterial as UnlitMaterial;
        this._lineMaterial.depthTest = RenderState.DEPTHTEST_ALWAYS;
        this._lineMaterial.depthWrite = false;
        this._lineMaterial.renderQueue = Material.RENDERQUEUE_TRANSPARENT + 100;
        this._lineMaterial.blend = RenderState.BLEND_ENABLE_ALL;
        this._lineMaterial.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
        this._lineMaterial.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        // The overlay itself must not receive DBuffer color from the scene.
        // 叠加面板自身不应接收场景中的 DBuffer 颜色。
        this._lineMaterial.addDefine(Shader3D.getDefineByName("DECAL_PROJECTOR"));
        this._line.pixelLineRenderer.castShadow = false;
        this._line.pixelLineRenderer.receiveShadow = false;
        this._line.active = false;
        this._preview.mouseEnabled = this._image.mouseEnabled = false;
        // PBR source maps and the preview's unblended 3D target contain
        // straight RGBA. Normal 2D blending expects premultiplied RGB.
        // PBR 源贴图与预览中未混合的 3D 目标存储非预乘 RGBA，
        // 常规 2D 混合要求 RGB 已预乘 alpha。
        this._image.blendMode = "sourceAlpha";
        this._preview.visible = false;
        this._preview.addChild(this._image);
        uiRoot.addChild(this._preview);
    }

    select(projector: DecalProjector, channel: DecalPreviewChannel = this._channel): void {
        if (this._disposed) return;
        if (channel !== "albedo" && channel !== "normal" && channel !== "maos")
            throw new RangeError("Unknown decal preview channel.");
        if (projector !== this._projector) {
            this._line.active = false;
            this._line.removeSelf();
            this._projector = projector;
            this._geometryKey = "";
            if (projector && !projector.destroyed && !projector.owner.destroyed)
                projector.owner.addChild(this._line);
        }
        this._channel = channel;
        this.update();
    }

    get showBounds(): boolean { return this._showBounds; }
    set showBounds(value: boolean) { this._showBounds = value; this.update(); }
    get showTexture(): boolean { return this._showTexture; }
    set showTexture(value: boolean) { this._showTexture = value; this.update(); }

    setPreviewRect(x: number, y: number, width: number, height: number): void {
        if (this._disposed) return;
        this._hasPreviewRect = isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height) && width > 0 && height > 0;
        if (this._hasPreviewRect) {
            this._preview.pos(x, y).size(width, height);
            this._preview.graphics.clear();
            const cell = 12;
            for (let row = 0; row * cell < height; row++) for (let col = 0; col * cell < width; col++)
                this._preview.graphics.drawRect(col * cell, row * cell, Math.min(cell, width - col * cell),
                    Math.min(cell, height - row * cell), (col + row) % 2 ? "#30362c" : "#23291f");
            this._layoutImage();
        }
        this.update();
    }

    /** Call after the sample updates its animated material time.
     * 在示例更新动画材质的时间参数后调用。 */
    update(): void {
        if (this._disposed) return;
        const projector = this._projector;
        const valid = !!projector && !projector.destroyed && !projector.owner.destroyed;
        this._line.active = valid && this._showBounds;
        this._preview.visible = valid && this._showTexture && this._hasPreviewRect;
        if (!valid) {
            this._setSource(null, "missing");
            if (this._previewCamera) this._previewCamera.enableRender = false;
            return;
        }
        const size = projector.size, pivot = projector.pivot;
        const geometryKey = [size.x, size.y, size.z, pivot.x, pivot.y, pivot.z].join(",");
        if (geometryKey !== this._geometryKey) {
            this._geometryKey = geometryKey;
            this._updateBox(projector);
        }
        const material = projector.material;
        if (material instanceof FlowingWaterDecalMaterial) {
            if (this._preview.visible) this._ensureWaterPreview();
            if (this._previewMaterial) {
                const data = this._previewMaterial.shaderData;
                data.setNumber(Shader3D.propertyNameToID("u_WaterTime"), material.time);
                data.setNumber(Shader3D.propertyNameToID("u_WaterFlowSpeed"), material.flowSpeed);
                data.setColor(Shader3D.propertyNameToID("u_WaterTint"), material.shaderData.getColor(Shader3D.propertyNameToID("u_WaterTint")));
                data.setColor(Shader3D.propertyNameToID("u_PreviewAlbedo"), material.albedoColor);
                data.setNumber(Shader3D.propertyNameToID("u_PreviewChannel"), this._channel === "albedo" ? 0 : this._channel === "normal" ? 1 : 2);
            }
            this._setSource(this._previewTarget, "procedural");
            if (this._previewCamera) this._previewCamera.enableRender = this._preview.visible;
        } else {
            if (this._previewCamera) this._previewCamera.enableRender = false;
            const source = material?.getTexture(this._channel === "albedo" ? "u_AlbedoTexture"
                : this._channel === "normal" ? "u_NormalTexture" : "u_MetallicGlossTexture");
            this._setSource(source, source ? "texture" : "missing");
        }
    }

    private _updateBox(projector: DecalProjector): void {
        this._line.clear();
        const size = projector.size, p = projector.pivot;
        const corners: Vector3[] = [];
        for (let i = 0; i < 8; i++) corners.push(new Vector3(p.x + (i & 1 ? 0.5 : -0.5) * size.x,
            p.y + (i & 2 ? 0.5 : -0.5) * size.y, p.z + (i & 4 ? 0.5 : -0.5) * size.z));
        const color = new Color(0.86, 0.94, 0.46, 0.9), front = new Color(0.42, 0.83, 0.89, 0.9);
        for (let i = 0; i < 8; i++) for (const bit of [1, 2, 4]) if (!(i & bit))
            this._line.addLine(corners[i], corners[i | bit], bit === 4 ? front : color, bit === 4 ? front : color);
        const length = Math.max(size.z, Math.min(size.x, size.y) * 0.32, 0.2);
        const start = new Vector3(p.x, p.y, p.z - size.z * 0.5);
        const tip = new Vector3(p.x, p.y, start.z + length), head = length * 0.16;
        this._line.addLine(start, tip, front, front);
        for (const [x, y] of [[head, 0], [-head, 0], [0, head], [0, -head]])
            this._line.addLine(tip, new Vector3(p.x + x, p.y + y, tip.z - head * 1.7), front, front);
    }

    private _setSource(source: BaseTexture, kind: "texture" | "procedural" | "missing"): void {
        this._kind = kind;
        if (this._source === source) return;
        this._image.texture = null;
        this._texture?.destroy(); // Texture wrapper releases references; it does not destroy its bitmap. 纹理包装只释放引用，不销毁底层位图。
        this._source = source;
        this._texture = source ? new Texture(source) : null;
        this._image.texture = this._texture;
        this._layoutImage();
    }

    private _layoutImage(): void {
        if (!this._source) return;
        const scale = Math.min(this._preview.width / this._source.width, this._preview.height / this._source.height);
        const width = this._source.width * scale, height = this._source.height * scale;
        this._image.pos((this._preview.width - width) * 0.5, (this._preview.height - height) * 0.5).size(width, height);
    }

    private _ensureWaterPreview(): void {
        if (this._previewScene) return;
        let shader = Shader3D.find(DecalInspector._shaderName);
        if (!shader) {
            shader = Shader3D.add(DecalInspector._shaderName, false, false);
            shader.shaderType = ShaderFeatureType.D3;
            const sub = new SubShader(SubShader.DefaultAttributeMap, {
                u_WaterTime: ShaderDataType.Float, u_WaterFlowSpeed: ShaderDataType.Float,
                u_WaterTint: ShaderDataType.Color, u_PreviewChannel: ShaderDataType.Float, u_PreviewAlbedo: ShaderDataType.Color
            }, { u_WaterTime: 0, u_WaterFlowSpeed: 0.16, u_WaterTint: Color.WHITE, u_PreviewChannel: 0, u_PreviewAlbedo: Color.WHITE });
            shader.addSubShader(sub);
            const pass = sub.addShaderPass(PreviewVS, WaterSurface + "\n" + PreviewFS);
            pass.statefirst = true;
            pass.renderState.cull = RenderState.CULL_NONE;
            pass.renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
            pass.renderState.depthWrite = false;
            pass.renderState.blend = RenderState.BLEND_DISABLE;
        }
        this._previewMaterial = new Material();
        this._previewMaterial.setShaderName(DecalInspector._shaderName);
        this._previewMesh = PrimitiveMesh.createQuad(2, 2);
        this._previewScene = new Scene3D();
        this._previewScene.name = "Decal inspector GPU preview";
        const quad = this._previewScene.addChild(new MeshSprite3D(this._previewMesh)) as MeshSprite3D;
        quad.meshRenderer.sharedMaterial = this._previewMaterial;
        quad.meshRenderer.castShadow = false;
        quad.meshRenderer.receiveShadow = false;
        this._previewCamera = this._previewScene.addChild(new Camera(1, 0.1, 10)) as Camera;
        this._previewCamera.orthographic = true;
        this._previewCamera.orthographicVerticalSize = 2;
        this._previewCamera.transform.position = new Vector3(0, 0, -2);
        this._previewCamera.transform.lookAt(new Vector3(), new Vector3(0, 1, 0));
        this._previewCamera.clearColor = new Color(0, 0, 0, 0);
        this._previewTarget = new RenderTexture(256, 256, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None, false, 1, false, false);
        this._previewCamera.renderTarget = this._previewTarget;
        Laya.stage.addChild(this._previewScene);
    }

    /** References to the actual presentation resources, also useful for demo diagnostics.
     * 实际显示资源的引用，也便于诊断示例。 */
    get info() {
        return { projector: this._projector, channel: this._channel, kind: this._kind,
            lineSprite: this._line, sourceTexture: this._kind === "texture" ? this._source : null,
            previewTexture: this._texture, previewTarget: this._previewTarget,
            previewSprite: this._preview, imageSprite: this._image, previewCamera: this._previewCamera,
            previewScene: this._previewScene, previewMaterial: this._previewMaterial };
    }

    dispose(): void {
        if (this._disposed) return;
        this._disposed = true;
        this._line.destroy();
        this._lineMaterial.destroy();
        this._image.texture = null;
        this._texture?.destroy();
        this._texture = null; this._source = null;
        this._preview.destroy(true);
        if (this._previewCamera) this._previewCamera.renderTarget = null;
        this._previewScene?.destroy(true);
        this._previewMaterial?.destroy();
        this._previewMesh?.destroy();
        this._previewTarget?.destroy();
        this._previewScene = null; this._previewCamera = null; this._previewTarget = null;
        this._previewMaterial = null; this._previewMesh = null; this._projector = null;
    }
}
