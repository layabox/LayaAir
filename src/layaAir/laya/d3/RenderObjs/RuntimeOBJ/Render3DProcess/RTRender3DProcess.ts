import { RTRenderContext3D } from "../RTRenderContext3D";
import { IRender3DProcess } from "../../../RenderDriverLayer/Render3DProcess/IRender3DProcess";
import { RTBaseRenderNode } from "../Render3DNode/RTBaseRenderNode";
import { RTForwardAddRP } from "./RTForwardAddRP";

export class RTRender3DProcess implements IRender3DProcess {
    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTRender3DProcess();
    }
    renderFowarAddCameraPass(context: RTRenderContext3D, renderpass: RTForwardAddRP, list: RTBaseRenderNode[], count: number): void {
        this._nativeObj.renderFowarAddCameraPass(context._nativeObj, renderpass._nativeObj, list, count);
    }

}