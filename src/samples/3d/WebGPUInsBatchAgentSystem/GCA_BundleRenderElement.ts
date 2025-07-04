import { WebGPURenderContext3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderBundle } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPURenderCommandEncoder } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderCommandEncoder";
import { WebGPUShaderData } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData";
import { GCA_BatchRenderElement } from "./GCA_BatchRenderElement";
import { WebGPUBindGroup } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBindGroupCache";

export class GCA_BatchBundleElement extends WebGPURenderElement3D {
    private _renderelements: GCA_BatchRenderElement[] = [];
    private _needRecreateRenderBundle: boolean = false;
    private _commadnBundle: WebGPURenderBundle = new WebGPURenderBundle();

    constructor() {
        super();
        this.isRender = true;
        this.materialShaderData = new WebGPUShaderData();
    }

    needRender() {
        return this._renderelements.length > 0;
    }

    addrenderElement(element: GCA_BatchRenderElement) {
        this._renderelements.push(element);
        this._needRecreateRenderBundle = true;
    }

    removerenderElement(element: GCA_BatchRenderElement) {
        let inddex = this._renderelements.indexOf(element);
        if (inddex != -1) {
            this._renderelements.splice(inddex, 1);
            this._needRecreateRenderBundle = true;
        }
    }

    notifyRecreateRenderBundle() {
        this._needRecreateRenderBundle = true;
    }
    private _cacheSceneGroup: WebGPUBindGroup;
    private _cacheCameraGroup: WebGPUBindGroup;

    _preUpdatePre(context: WebGPURenderContext3D) {
        if (context._sceneBindGroup != this._cacheSceneGroup || context._cameraBindGroup != this._cacheCameraGroup) {
            this._needRecreateRenderBundle = true;
        }

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
            this._cacheSceneGroup = context._sceneBindGroup;
            this._cacheCameraGroup = context._cameraBindGroup;
        }
        (command as WebGPURenderCommandEncoder).excuteBundle([this._commadnBundle._gpuBundle])
        return 0;
    }


}