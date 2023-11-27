import { RenderState } from "../../../../../RenderEngine/RenderShader/RenderState";
import { Vector2 } from "../../../../../maths/Vector2";
import { Stat } from "../../../../../utils/Stat";
import { Utils } from "../../../../../utils/Utils";
import { Laya3DRender } from "../../../../RenderObjs/Laya3DRender";
import { Camera } from "../../../Camera";
import { Transform3D } from "../../../Transform3D";
import { Material, MaterialRenderMode } from "../../../../../resource/Material";
import { RenderContext3D } from "../../RenderContext3D";
import { RenderElement } from "../../RenderElement";
import { Command } from "../../command/Command";
import { LensFlareElement, LensFlareEffect } from "./LensFlareEffect";
import { LensFlareElementGeomtry } from "./LensFlareGeometry";

export class LensFlareCMD extends Command {

    /**@internal geoemtry */
    private _lensFlareGeometry: LensFlareElementGeomtry;

    /**@internal renderElement*/
    private _renderElement: RenderElement;

    /**@internal */
    private _materials: Material;

    /**@internal */
    private _transform3D: Transform3D;

    /**@internal */
    private _lensFlareElementData: LensFlareElement;

    /**instance绘制的个数 */
    private _instanceCount: number = 1;

    public get instanceCount(): number {
        return this._instanceCount;
    }
    public set instanceCount(value: number) {
        this._instanceCount = value;
    }



    /**
     * instance CMD
     */
    constructor() {
        super();
        this._transform3D = Laya3DRender.renderOBJCreate.createTransform(null);
        this._renderElement = new RenderElement();
        this._lensFlareGeometry = new LensFlareElementGeomtry();
        this._renderElement.setTransform(this._transform3D);
        this._renderElement.setGeometry(this._lensFlareGeometry);
        this._initMaterial();
    }

    /**
     * init material
     */
    private _initMaterial() {
        this._materials = new Material();
        this._materials.setShaderName("LensFlare");
        this._materials.materialRenderMode = MaterialRenderMode.RENDERMODE_ADDTIVE;
        this._materials.depthTest = RenderState.DEPTHTEST_ALWAYS;
        this._materials.cull = RenderState.CULL_NONE;
        this._renderElement.material = this._materials;
        this._renderElement.renderSubShader = this._materials.shader.getSubShaderAt(0);
        this._renderElement.subShaderIndex = 0;

    }

    /**@internal */
    set center(value: Vector2) {
        this._materials.setVector2("u_FlareCenter", value);
    }

    /**@internal */
    set rotate(value: number) {
        this._materials.setFloat("u_rotate", value);
    }

    /**@internal */
    set lensFlareElement(value: LensFlareElement) {
        this._lensFlareElementData = value;
        this.applyElementData();
    }

    get lensFlareElement(): LensFlareElement {
        return this._lensFlareElementData;
    }

    /**
     * apply element Data
     */
    applyElementData() {
        //根据LensFlareElement更新数据
        this._materials.setTexture("u_FlareTexture", this._lensFlareElementData.texture);
        this._materials.setColor("u_Tint", this._lensFlareElementData.tint);
        this._materials.setFloat("u_TintIntensity", this._lensFlareElementData.intensity);
        this._materials.setVector2("u_Postionoffset", this._lensFlareElementData.positionOffset);
        this._materials.setFloat("u_Angularoffset", this._lensFlareElementData.angularOffset);
        if (this._lensFlareElementData.autoRotate) {
            this._materials.addDefine(LensFlareEffect.SHADERDEFINE_AUTOROTATE);
        } else {
            this._materials.removeDefine(LensFlareEffect.SHADERDEFINE_AUTOROTATE);
        }
        //其他TODO

        //更新InstanceBuffer
        this._lensFlareGeometry.instanceCount = 1;//TODO
        // startPos、angular、scaleX、scaleY
        let testFloat = new Float32Array([this._lensFlareElementData.startPosition, Utils.toAngle(this._lensFlareElementData.rotation), this._lensFlareElementData.scale.x, this._lensFlareElementData.scale.y]);//TODO        
        // instanceBuffer set
        this._lensFlareGeometry.instanceBuffer.setData(testFloat.buffer, 0, 0, testFloat.length * 4);//TODO
    }

    /**
     * @inheritDoc
     * @override
     */
    run(): void {
        var context = RenderContext3D._instance;
        this._materials.setFloat("u_aspectRatio", context.camera.viewport.height / context.camera.viewport.width);
        context.applyContext(Camera._updateMark);
        context.drawRenderElement(this._renderElement);
        Stat.blitDrawCall++;
    }

    /**
     * @internal
     */
    recover(): void {
        //TODO
    }

    /**
     * @internal
     */
    destroy(): void {
        //TODO
    }
}