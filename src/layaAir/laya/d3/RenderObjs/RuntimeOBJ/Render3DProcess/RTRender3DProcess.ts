import { IRenderContext3D } from "../../../RenderDriverLayer/IRenderContext3D";
import { IBaseRenderNode } from "../../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { IForwardAddRP } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddRP";
import { IRender3DProcess } from "../../../RenderDriverLayer/Render3DProcess/IRender3DProcess";

export class RTRender3DProcess implements IRender3DProcess {
    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTRender3DProcess();
    }
    renderFowarAddCameraPass(context: IRenderContext3D, renderpass: IForwardAddRP, list: IBaseRenderNode[], count: number): void {
        throw new Error("Method not implemented.");
    }

}