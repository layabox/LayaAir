import { WebGPURenderContext3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderBundle } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPURenderCommandEncoder } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderCommandEncoder";
import { WebGPUShaderData } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData";
import { GCA_BatchRenderElement } from "./GCA_BatchRenderElement";

export class GCA_BatchBundleElement extends WebGPURenderElement3D {
    private _renderelements: GCA_BatchRenderElement[] = [];
    private _needRecreateRenderBundle: boolean = false;
    private _commadnBundle: WebGPURenderBundle = new WebGPURenderBundle();

    constructor() {
        super();
        this.isRender = true;
        this.materialRenderQueue = 2000;
        this.materialShaderData = new WebGPUShaderData();
    }

    addrenderElement(element: GCA_BatchRenderElement) {
        this._renderelements.push(element);
        this._needRecreateRenderBundle = true;
    }

    _preUpdatePre(context: WebGPURenderContext3D) {
        for (var i = 0; i < this._renderelements.length; i++) {
            this._renderelements[i]._preUpdatePre(context);
        }
    }

    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (this._needRecreateRenderBundle) {
            this._commadnBundle.startRender(context.destRT, "renderCullBundle");
            for (var i = 0; i < this._renderelements.length; i++) {
                this._renderelements[i]._render(context, this._commadnBundle);
            }
            this._commadnBundle.finish("renderCullBundle");
            this._needRecreateRenderBundle = false;
        }
        (command as WebGPURenderCommandEncoder).excuteBundle([this._commadnBundle._gpuBundle])
        return 0;
    }
}