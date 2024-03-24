import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Viewport } from "../../../d3/math/Viewport";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D, PipelineMode } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderBundleManager } from "../RenderDevice/WebGPUBundle/WebGPURenderBundleManager";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPUContext } from "./WebGPUContext";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

export class WebGPURenderContext3D implements IRenderContext3D {
    globalConfigShaderData: WebDefineDatas;
    /**@internal */
    private _globalShaderData: WebGPUShaderData;
    /**@internal */
    private _sceneData: WebGPUShaderData;
    /**@internal */
    private _sceneModuleData: WebSceneNodeData;
    /**@internal */
    private _cameraModuleData: WebCameraNodeData;
    /**@internal */
    private _cameraData: WebGPUShaderData;
    /**@internal */
    private _viewPort: Viewport;
    /**@internal */
    private _scissor: Vector4;
    /**@internal */
    private _sceneUpdataMask: number = 0;
    /**@internal */
    private _cameraUpdateMask: number = 0;
    /**@internal */
    private _pipelineMode: PipelineMode;
    /**@internal */
    private _invertY: boolean;
    /**@internal */
    private _clearFlag: number;
    /**@internal */
    private _clearColor: Color = Color.BLACK;
    /**@internal */
    private _clearDepth: number;
    /**@internal */
    private _clearStencil: number;
    /**@internal */
    private _needStart: boolean = true;

    device: GPUDevice;
    bundleManager: WebGPURenderBundleManager = new WebGPURenderBundleManager();
    elementsToBundle: WebGPURenderElement3D[] = [];

    destRT: WebGPUInternalRT;
    renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder();

    globalId: number;
    objectName: string = 'WebGPURenderContext3D';

    constructor() {
        this.globalId = WebGPUGlobal.getId(this);
    }

    get sceneData(): WebGPUShaderData {
        return this._sceneData;
    }

    set sceneData(value: WebGPUShaderData) {
        this._sceneData = value;
    }

    get cameraData(): WebGPUShaderData {
        return this._cameraData;
    }

    set cameraData(value: WebGPUShaderData) {
        this._cameraData = value;
    }

    get sceneModuleData(): WebSceneNodeData {
        return this._sceneModuleData;
    }

    set sceneModuleData(value: WebSceneNodeData) {
        this._sceneModuleData = value;
    }

    get cameraModuleData(): WebCameraNodeData {
        return this._cameraModuleData;
    }

    set cameraModuleData(value: WebCameraNodeData) {
        this._cameraModuleData = value;
    }

    get globalShaderData(): WebGPUShaderData {
        return this._globalShaderData;
    }

    set globalShaderData(value: WebGPUShaderData) {
        this._globalShaderData = value;
    }

    get sceneUpdataMask(): number {
        return this._sceneUpdataMask;
    }

    set sceneUpdataMask(value: number) {
        this._sceneUpdataMask = value;
    }

    get cameraUpdateMask(): number {
        return this._cameraUpdateMask;
    }

    set cameraUpdateMask(value: number) {
        this._cameraUpdateMask = value;
    }

    get pipelineMode(): PipelineMode {
        return this._pipelineMode;
    }

    set pipelineMode(value: PipelineMode) {
        this._pipelineMode = value;
    }

    get invertY(): boolean {
        return this._invertY;
    }

    set invertY(value: boolean) {
        this._invertY = value;
    }

    setRenderTarget(rt: WebGPUInternalRT, clearFlag: RenderClearFlag): void {
        this._clearFlag = clearFlag;
        if (rt !== this.destRT) {
            this.destRT = rt;
            this._needStart = true;
        }
    }

    setViewPort(value: Viewport): void {
        this._viewPort = value;
    }

    setScissor(value: Vector4): void {
        this._scissor = value;
    }

    setClearData(flag: number, color: Color, depth: number, stencil: number): number {
        this._clearFlag = flag;
        this._clearDepth = depth;
        this._clearStencil = stencil;
        color.cloneTo(this._clearColor);
        return 0;
    }

    drawRenderElementList(list: SingletonList<WebGPURenderElement3D>): number {
        if (list.length === 0) return 0;
        this._setScreenRT();
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }

        WebGPUContext.startRender();

        let compile = false;
        const elements = list.elements;
        for (let i = 0, n = list.length; i < n; i++) {
            compile = elements[i]._preUpdatePre(this);
            if (compile && WebGPUGlobal.useBundle)
                this.bundleManager.removeBundleByElement(elements[i].bundleId);
        }

        if (WebGPUGlobal.useBundle) {
            const needRemoveBundle = [];
            this.bundleManager.clearShot();
            for (let i = 0, n = list.length; i < n; i++) {
                if (this.bundleManager.getBundle(elements[i].bundleId) === null) {
                    if (this.elementsToBundle.indexOf(elements[i]) === -1)
                        this.elementsToBundle.push(elements[i]);
                    if (this.elementsToBundle.length >= this.bundleManager.elementsMaxPerBundle) {
                        this.bundleManager.createBundle(this, this.elementsToBundle);
                        this.elementsToBundle.length = 0;
                    }
                    elements[i]._render(this, this.renderCommand, null);
                } else {
                    elements[i]._render(this, null, null);
                    if (elements[i].needClearBundle) {
                        needRemoveBundle.push(elements[i].bundleId);
                        elements[i].needClearBundle = false;
                    }
                }
            }
            const remove = this.bundleManager.removeLowShotBundle();
            if (needRemoveBundle.length > 0 || remove) {
                for (let i = 0, n = needRemoveBundle.length; i < n; i++)
                    this.bundleManager.removeBundleByElement(needRemoveBundle[i]);
                for (let i = 0, n = list.length; i < n; i++)
                    if (this.bundleManager.getBundle(elements[i].bundleId) === null)
                        elements[i]._render(this, this.renderCommand, null);
            }
            this.bundleManager.renderBundles(this.renderCommand._encoder);
        } else {
            for (let i = 0, n = list.length; i < n; i++)
                elements[i]._render(this, this.renderCommand, null);
        }
        this._submit();
        WebGPUStatis.addRenderElement(list.length);
        return 0;
    }

    drawRenderElementOne(node: WebGPURenderElement3D): number {
        this._setScreenRT();
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }
        node._preUpdatePre(this);
        node._render(this, this.renderCommand, null);
        this._submit();
        WebGPUStatis.addRenderElement(1);
        return 0;
    }

    runOneCMD(cmd: IRenderCMD): void {
        cmd.apply(this);
    }

    runCMDList(cmds: IRenderCMD[]): void {
        cmds.forEach(cmd => cmd.apply(this));
    }

    private _setScreenRT() {
        if (!this.destRT) {
            const context = WebGPURenderEngine._instance._context;
            WebGPURenderEngine._instance._screenRT._textures[0].resource = context.getCurrentTexture();
            WebGPURenderEngine._instance._screenRT._textures[0].multiSamplers = 1;
            this.setRenderTarget(WebGPURenderEngine._instance._screenRT, RenderClearFlag.Color | RenderClearFlag.Depth);
        }
    }

    private _start() {
        this.device = WebGPURenderEngine._instance.getDevice();
        const renderPassDesc: GPURenderPassDescriptor
            = WebGPURenderPassHelper.getDescriptor(this.destRT, this._clearFlag, this._clearColor, this._clearDepth, this._clearStencil);
        this.renderCommand.startRender(renderPassDesc);
        this._viewPort.y = 0; //不设零会报错
        this._scissor.y = 0;
        this.renderCommand.setViewport(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height, 0, 1);
        this.renderCommand.setScissorRect(this._scissor.x, this._scissor.y, this._scissor.z, this._scissor.w);
    }

    private _submit() {
        this.renderCommand.end();
        if (WebGPUGlobal.useBigBuffer)
            WebGPURenderEngine._instance.upload(); //上传所有Uniform数据
        this.device.queue.submit([this.renderCommand.finish()]);
        this._needStart = true;
        WebGPUStatis.addSubmit();
        //console.log('submit');
    }

    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}