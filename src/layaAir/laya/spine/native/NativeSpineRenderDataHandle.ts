import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { ISpineRenderDataHandle } from "../interface/ISpineRenderDataHandle";
import { RTBaseRenderDataHandle } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/2D/RTRenderDataHandle";
import { RTRenderStruct2D } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/2D/RTRenderStruct2D";
import { SpineShaderInit } from "../shader/SpineShaderInit";

/** @internal Native Spine handle backed by conchRTSpineRenderDataHandle. */
export class NativeSpineRenderDataHandle extends RTBaseRenderDataHandle implements ISpineRenderDataHandle {
    private _offset: Vector2 = new Vector2();
    private _baseColor: Color = new Color(1, 1, 1, 1);

    skeleton: spine.Skeleton;
    renderMatrixVersion: number = -1;

    constructor() {
        super(new (window as any).conchRTSpineRenderDataHandle());
    }

    public get baseColor(): Color {
        return this._baseColor;
    }

    public set baseColor(value: Color) {
        if (value !== this._baseColor && this._baseColor.equal(value))
            return;
        value = value || Color.BLACK;
        value.cloneTo(this._baseColor);
        this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
        this._nativeObj.setBaseColor(this._baseColor);
    }

    public get owner(): RTRenderStruct2D {
        return this._owner;
    }

    public set owner(value: RTRenderStruct2D) {
        if (value === this._owner)
            return;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.removeDefine(SpineShaderInit.SPINE_UV);
            shaderData.removeDefine(SpineShaderInit.SPINE_COLOR);
        }
        this._owner = value;
        this._nativeObj.setOwner(value ? value._nativeObj : null);
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.addDefine(SpineShaderInit.SPINE_UV);
            shaderData.addDefine(SpineShaderInit.SPINE_COLOR);
        }
    }

    public get offset(): Vector2 {
        return this._offset;
    }

    public set offset(value: Vector2) {
        this._offset = value;
        this._nativeObj.setOffset(value);
    }
}
