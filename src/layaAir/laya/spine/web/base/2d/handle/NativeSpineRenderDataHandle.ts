import { Color } from "../../../../../maths/Color";
import { Vector2 } from "../../../../../maths/Vector2";
import { BaseRenderNode2D } from "../../../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { RTRenderStruct2D } from "../../../../../RenderDriver/RenderModuleData/RuntimeModuleData/2D/RTRenderStruct2D";
import { ISpineRenderDataHandle } from "../../../../interface/ISpineRenderDataHandle";
import { SpineShaderInit } from "../../../../shader/SpineShaderInit";


/** @internal Native Spine handle backed by conchRTSpineRenderDataHandle. */
export class NativeSpineRenderDataHandle implements ISpineRenderDataHandle {
    _nativeObj: any;
    private _owner: RTRenderStruct2D;
    private _needUseMatrix: boolean = true;
    private _lightReceive: boolean = false;
    private _offset: Vector2 = new Vector2();
    private _baseColor: Color = new Color(1, 1, 1, 1);

    skeleton: spine.Skeleton;
    renderMatrixVersion: number = -1;

    constructor() {
        this._nativeObj = new (window as any).conchRTSpineRenderDataHandle();
        this._nativeObj.needUseMatrix = true;
    }

    public get needUseMatrix(): boolean {
        return this._needUseMatrix;
    }

    public set needUseMatrix(value: boolean) {
        if (this._needUseMatrix === value)
            return;
        this._needUseMatrix = value;
        this._nativeObj.needUseMatrix = value;
    }

    public get lightReceive(): boolean {
        return this._lightReceive;
    }

    public set lightReceive(value: boolean) {
        if (this._lightReceive === value)
            return;
        this._lightReceive = value;
        if (!this._owner?.spriteShaderData)
            return;
        if (value)
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        else
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
    }

    public get baseColor(): Color {
        return this._baseColor;
    }

    public set baseColor(value: Color) {
        if (value !== this._baseColor && this._baseColor.equal(value))
            return;
        value = value || Color.BLACK;
        value.cloneTo(this._baseColor);
        if (this._owner?.spriteShaderData)
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
        this._nativeObj.setBaseColor(this._baseColor);
    }

    public get owner(): RTRenderStruct2D {
        return this._owner;
    }

    public set owner(value: RTRenderStruct2D) {
        if (value === this._owner)
            return;
        this._setOwnerLocal(value);
        this._nativeObj.setOwner(value ? value._nativeObj : null);
    }

    /** @internal Update the TypeScript mirror after RTRenderStruct2D attached the native handle. */
    _setOwnerLocal(value: RTRenderStruct2D): void {
        if (value === this._owner)
            return;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.removeDefine(SpineShaderInit.SPINE_UV);
            shaderData.removeDefine(SpineShaderInit.SPINE_COLOR);
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
        this._owner = value;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.addDefine(SpineShaderInit.SPINE_UV);
            shaderData.addDefine(SpineShaderInit.SPINE_COLOR);
            if (this._lightReceive)
                shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
    }

    public get offset(): Vector2 {
        return this._offset;
    }

    public set offset(value: Vector2) {
        this._offset = value;
        this._nativeObj.setOffset(value);
    }

    inheriteRenderData(context: IRenderContext2D): void {
        if (this._nativeObj)
            this._nativeObj.inheriteRenderData((context as any)._nativeObj);
    }

    destroy(): void {
        this.owner = null;
        this.skeleton = null;
        this._nativeObj?.destroy();
        this._nativeObj = null;
    }
}
