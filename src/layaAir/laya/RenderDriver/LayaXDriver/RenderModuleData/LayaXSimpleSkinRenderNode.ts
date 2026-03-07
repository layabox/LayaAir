import { Vector4 } from "../../../maths/Vector4";
import { ISimpleSkinRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXBaseRenderNode } from "./LayaXBaseRenderNode";

/**
 * LayaX SimpleSkinRenderNode bridge.
 *
 * Simple (non-skeletal) skin animation data is pushed to native via
 * `conchLayaXSimpleSkinRenderNode`.  The animator params (a Vector4)
 * are written to a shared buffer.
 */
export class LayaXSimpleSkinRenderNode extends LayaXBaseRenderNode implements ISimpleSkinRenderNode {

    /** @internal */
    private _shareBuffer: Float32Array;

    /** @internal */
    protected _getNativeObj(): void {
        this._nativeObj = new (window as any).conchLayaXSimpleSkinRenderNode();
        // TODO(Q13): Determine if LayaX uses a shared ArrayBuffer like the RT path,
        // or if simple setter calls are sufficient.
        let buffer = new ArrayBuffer(4 * 4);
        this._shareBuffer = new Float32Array(buffer);
        this._nativeObj.setShareBuffer(buffer);
    }

    constructor() {
        super();
    }

    setSimpleAnimatorParams(value: Vector4): void {
        this._shareBuffer[0] = value.x;
        this._shareBuffer[1] = value.y;
        this._shareBuffer[2] = value.z;
        this._shareBuffer[3] = value.w;
        this._nativeObj.setSimpleAnimatorParamsByBuffer();
    }
}
