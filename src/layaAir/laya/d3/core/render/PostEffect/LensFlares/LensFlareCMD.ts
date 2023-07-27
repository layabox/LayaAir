import { RenderElement } from "laya/d3/core/render/RenderElement";
import { Command } from "laya/d3/core/render/command/Command";
import { Material, MaterialRenderMode } from "laya/d3/core/material/Material";
import { Transform3D } from "laya/d3/core/Transform3D";
import { LayaGL } from "laya/layagl/LayaGL";
import { RenderState } from "laya/RenderEngine/RenderShader/RenderState";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { Camera } from "laya/d3/core/Camera";
import { Stat } from "laya/utils/Stat";
import { Vector2 } from "laya/maths/Vector2";
import { LensFlareElementGeomtry } from "./LensFlareGeometry";
import { LensFlareElement } from "./LensFlareEffect";

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

    /**
     * instance CMD
     */
    constructor() {
        super();
        this._transform3D = LayaGL.renderOBJCreate.createTransform(null);
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

    /**
     * apply element Data
     */
    applyElementData() {
        //根据LensFlareElement更新数据
        this._materials.setTexture("u_FlareTexture", this._lensFlareElementData.texture);
        this._materials.setColor("u_Tint", this._lensFlareElementData.tint);
        //其他TODO

        //更新InstanceBuffer
        this._lensFlareGeometry.instanceCount = 1;//TODO
        let testFloat = new Float32Array([this._lensFlareElementData.startPosition, this._lensFlareElementData.AngularOffset, 1, 1]);//TODO
        this._lensFlareGeometry.instanceBuffer.setData(testFloat, 0, 0, 4 * 4);//TODO
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