import { Camera } from "../../../d3/core/Camera";
import { IRender3DProcess, IRenderContext3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { RTBaseRenderNode } from "../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";
import { GLESForwardAddRP } from "./GLESForwardAddRP";
import { GLESRenderContext3D } from "./GLESRenderContext3D";


export class GLESRender3DProcess implements IRender3DProcess {
    private _nativeObj: any;
    private _tempList: any = [];
    constructor() {
        this._nativeObj = new (window as any).conchRTRender3DProcess();
    }
    fowardRender(context: IRenderContext3D, camera: Camera): void {
        throw new Error("Method not implemented.");
    }
    
    renderFowarAddCameraPass(context: GLESRenderContext3D, renderpass: GLESForwardAddRP, list: RTBaseRenderNode[], count: number): void {
        this._tempList.length = 0;
        list.forEach((element) => {
            this._tempList.push((element as any)._nativeObj);
        });
        this._nativeObj.renderFowarAddCameraPass(context._nativeObj, renderpass._nativeObj, this._tempList, count);
    }

}