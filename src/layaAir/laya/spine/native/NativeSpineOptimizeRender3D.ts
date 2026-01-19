import { IBaseRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SpineShaderInit } from "../shader/SpineShaderInit";
import { TSpineBakeData } from "../SpineConst";
import { NativeSpineOptimizeRenderBase } from "./NativeSpineOptimizeRenderBase";

/**
 * @en Native Spine Optimize Render 3D wrapper class.
 * @zh Native Spine 优化渲染 3D 封装类。
 */
export class NativeSpineOptimizeRender3D extends NativeSpineOptimizeRenderBase {
    protected declare _owner: IBaseRenderNode;

    constructor(owner: IBaseRenderNode, nativeRender: any) {
        super(owner, nativeRender);
    }

    initBake(obj: TSpineBakeData): void {
    if (!this._nativeRender) {
        return;
    }

    let shaderData = this._owner.shaderData;
    let texture = obj.texture2d;
    shaderData.setTexture(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, texture);
    shaderData.setNumber(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, texture.width);
    super.initBake(obj);
}
}
