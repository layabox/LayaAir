import { Vector4 } from "../../../../maths/Vector4";
import { ISimpleSkinRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { NativeMemory } from "../NativeMemory";
import { RTBaseRenderNode } from "./RTBaseRenderNode";

export class RTSimpleSkinRenderNode extends RTBaseRenderNode implements ISimpleSkinRenderNode {
    private _nativeMemory: NativeMemory;
    private _float32Array: Float32Array;
    setSimpleAnimatorParams(value: Vector4): void {
        //this._nativeObj.setSimpleAnimatorParams(value);  
        this._float32Array[0] = value.x;      
        this._float32Array[1] = value.y;      
        this._float32Array[2] = value.z;      
        this._float32Array[3] = value.w;      
        this._nativeObj.setSimpleAnimatorParamsByBuffer();
    }

    protected _getNativeObj() {
        this._nativeObj = new (window as any).conchRTSimpleSkinRenderNode();
        this._nativeMemory = new NativeMemory(4 * 4, true);
        this._nativeObj.setShareBuffer(this._nativeMemory._buffer);
        this._float32Array = this._nativeMemory.float32Array;
    }

    constructor() {
        super();
    }
}