import { IRender3DProcess } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RTBaseRenderNode } from "../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";
import { GLESForwardAddRP } from "./GLESForwardAddRP";
import { GLESRenderContext3D } from "./GLESRenderContext3D";


export class GLESRender3DProcess implements IRender3DProcess {
    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTRender3DProcess();
    }
    renderFowarAddCameraPass(context: GLESRenderContext3D, renderpass: GLESForwardAddRP, list: RTBaseRenderNode[], count: number): void {
        this._nativeObj.renderFowarAddCameraPass(context._nativeObj, renderpass._nativeObj, list, count);
    }

}