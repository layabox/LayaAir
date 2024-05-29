import { Vector4 } from "../../../../maths/Vector4";
import { ISimpleSkinRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { RTBaseRenderNode } from "./RTBaseRenderNode";

export class RTSimpleSkinRenderNode extends RTBaseRenderNode implements ISimpleSkinRenderNode {
    setSimpleAnimatorParams(value: Vector4): void {
        this._nativeObj.setSimpleAnimatorParams(value);
    }

    protected _getNativeObj() {
        this._nativeObj = new (window as any).conchRTSimpleSkinRenderNode();
    }

    constructor() {
        super();
    }
}