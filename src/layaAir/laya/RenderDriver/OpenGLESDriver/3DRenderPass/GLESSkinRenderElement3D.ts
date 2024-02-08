import { LayaGL } from "../../../layagl/LayaGL";
import { GLESRenderElement3D, RenderElementType } from "./GLESRenderElement3D";

export class GLESSkinRenderElement3D extends GLESRenderElement3D {

    _skinnedData: Float32Array[];

    constructor() {
        super();
    }
    get skinnedData(): Float32Array[] {
        return this._skinnedData;
    }
    set skinnedData(data: Float32Array[]) {
        this._skinnedData = data;
        this._nativeObj._skinnedData = data;
    }
    init(): void {
        this._nativeObj = new (window as any).conchGLESSkinRenderElement3D();
    }
}