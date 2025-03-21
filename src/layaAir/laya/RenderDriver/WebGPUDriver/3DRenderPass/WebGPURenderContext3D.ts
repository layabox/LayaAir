import { Laya } from "../../../../Laya";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext3D, PipelineMode } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderBundleManagerSet } from "../RenderDevice/WebGPUBundle/WebGPURenderBundleManagerSet";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

/**
 * WebGPU渲染上下文
 */
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
    private _clearColor: Color = Color.BLACK.clone();
    /**@internal */
    private _clearDepth: number;
    /**@internal */
    private _clearStencil: number;
    /**@internal */
    private _needStart: boolean = true;

    device: GPUDevice; //GPU设备
    bundleHit: number = 0; //命中Bundle
    needRemoveBundle: number[] = []; //需要清除绘图指令缓存的渲染节点
    bundleManagerSets: Map<string, WebGPURenderBundleManagerSet> = new Map(); //绘图指令缓存组

    destRT: WebGPUInternalRT; //渲染目标
    blitFrameCount: number = 0; //渲染到屏幕时的帧序号
    blitScreen: boolean = false; //正在渲染到屏幕
    renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器

    pipelineCache: any[] = []; //所有的3D渲染管线缓存

    private _viewScissorSaved: boolean = false;
    private _viewPortSave: Viewport = new Viewport();
    private _scissorSave: Vector4 = new Vector4();

    notifyGPUBufferChangeCounter: number = 0;

    globalId: number;
    objectName: string = 'WebGPURenderContext3D';

    constructor() {
        this.globalId = WebGPUGlobal.getId(this);
        this.device = WebGPURenderEngine._instance.getDevice();
        WebGPURenderEngine._instance.gpuBufferMgr.renderContext = this;
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

    /**
     * 设置渲染目标
     * @param rt 
     * @param clearFlag 
     */
    setRenderTarget(rt: WebGPUInternalRT, clearFlag: RenderClearFlag): void {
        this._clearFlag = clearFlag;
        if (rt !== this.destRT) {
            this.destRT = rt;
            this._needStart = true;
        }
    }

    /**
     * 设置视口
     * @param value 
     */
    setViewPort(value: Viewport): void {
        this._viewPort = value;
    }

    /**
     * 设置裁剪
     * @param value 
     */
    setScissor(value: Vector4): void {
        this._scissor = value;
    }

    /**
     * 保存视口
     */
    saveViewPortAndScissor() {
        if (this._viewPort && this._scissor) {
            this._viewPort.cloneTo(this._viewPortSave);
            this._scissor.cloneTo(this._scissorSave);
            this._viewScissorSaved = true;
        }
    }

    /**
     * 恢复视口
     */
    restoreViewPortAndScissor() {
        if (this._viewScissorSaved) {
            this._viewPortSave.cloneTo(this._viewPort);
            this._scissorSave.cloneTo(this._scissor);
            this._viewScissorSaved = false;
        }
    }

    /**
     * 设置清除参数
     * @param flag 
     * @param color 
     * @param depth 
     * @param stencil 
     */
    setClearData(flag: number, color: Color, depth: number, stencil: number): number {
        this._clearFlag = flag;
        this._clearDepth = depth;
        this._clearStencil = stencil;
        color.cloneTo(this._clearColor);
        return 0;
    }

    /**
     * 得到GPUBuffer改变的通知
     */
    notifyGPUBufferChange() {
        this.bundleManagerSets.forEach(bms => bms.clearBundle());
        this.bundleManagerSets.clear();
        //console.log('clear renderBuddle', this.notifyGPUBufferChangeCounter++);
    }

    /**
     * 获取指令缓存组的key
     */
    getBundleManagerKey() {
        return this.cameraData._id + '_' + this.destRT.globalId;
    }

    /**
     * 渲染一组节点
     * @param list 
     */
    drawRenderElementList(list: FastSinglelist<WebGPURenderElement3D>): number {
        const len = list.length;
        if (len === 0) return 0; //没有需要渲染的对象
        this._setScreenRT(); //如果没有渲染目标，则将屏幕作为渲染目标
        if (this._needStart) {
            this._start(); //为录制渲染命令做准备
            this._needStart = false;
        }

        let compile = false;
        let createBundleCount = 0;
        const elements = list.elements;
        let element: WebGPURenderElement3D;
        for (let i = 0; i < len; i++) {
            element = elements[i];
            element._preUpdatePre(this); //渲染前准备，如有必要，编译着色器

        }
        for (let i = 0; i < len; i++)
            elements[i]._render(this, this.renderCommand);
        this._submit(); //提交渲染命令
        WebGPUStatis.addRenderElement(list.length); //统计渲染节点数量
        return 0;
    }

    /**
     * 渲染一个节点
     * @param node 
     */
    drawRenderElementOne(node: WebGPURenderElement3D): number {
        this._setScreenRT();
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }

        //如果使用全局上下文，先清除上下文缓存
        // if (WebGPUGlobal.useGlobalContext)
        //     WebGPUContext.startRender();

        node._preUpdatePre(this);
        node._render(this, this.renderCommand);
        this._submit();
        WebGPUStatis.addRenderElement(1);
        return 0;
    }

    /**
     * 执行命令列表
     * @param cmds 
     */
    runCMDList(cmds: IRenderCMD[]): void {
        cmds.forEach(cmd => cmd.apply(this));
    }

    /**
     * 执行单个命令
     * @param cmd 
     */
    runOneCMD(cmd: IRenderCMD): void {
        cmd.apply(this);
    }

    /**
     * 清除渲染目标（空白绘制，用于清除颜色或深度缓存）
     */
    clearRenderTarget() {
        this._start(false);
        this._submit();
    }

    /**
     * 设置屏幕渲染目标
     */
    private _setScreenRT() {
        if (!this.destRT) { //如果渲染目标为空，设置成屏幕渲染目标，绘制到画布上
            const engine = WebGPURenderEngine._instance;
            engine._screenResized = false;
            engine._screenRT._textures[0].resource = engine._context.getCurrentTexture();
            engine._screenRT._textures[0].multiSamplers = 1;
            if (this.blitFrameCount === Laya.timer.currFrame)
                this.setRenderTarget(engine._screenRT, RenderClearFlag.Nothing);
            else this.setRenderTarget(engine._screenRT, RenderClearFlag.Color | RenderClearFlag.Depth);
            Color.BLACK.cloneTo(this._clearColor);
            this.blitFrameCount = Laya.timer.currFrame;
            this.blitScreen = true;
        } else this.blitScreen = false;
    }

    /**
     * 准备录制渲染命令
     * @param viewPortAndScissor 
     */
    private _start(viewPortAndScissor: boolean = true) {
        const renderPassDesc: GPURenderPassDescriptor
            = WebGPURenderPassHelper.getDescriptor(this.destRT, this._clearFlag, this._clearColor, this._clearDepth, this._clearStencil);
        this.renderCommand.startRender(renderPassDesc);
        this._clearFlag = RenderClearFlag.Nothing;
        if (viewPortAndScissor) {
            if (this._viewPort) {
                this._viewPort.y = this._viewPort.y | 0; //有时候会传进来小数
                this._viewPort.width = this._viewPort.width | 0;
                this._viewPort.height = this._viewPort.height | 0;
                this.renderCommand.setViewport(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height, 0, 1);
            }
            if (this._scissor) {
                this._scissor.y = this._scissor.y | 0;
                this.renderCommand.setScissorRect(this._scissor.x, this._scissor.y, this._scissor.z, this._scissor.w);
            }
        }
    }

    /**
     * 提交渲染命令
     */
    private _submit() {
        const engine = WebGPURenderEngine._instance;
        if (this.blitScreen && engine._screenResized) return; //屏幕尺寸改变，丢弃这一帧
        this.renderCommand.end();
        engine.upload(); //上传Uniform数据
        this.device.queue.submit([this.renderCommand.finish()]);
        this._needStart = true;
        WebGPUStatis.addSubmit(); //统计提交次数
        engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_DrawCallCount, 1);
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
        this.notifyGPUBufferChange();
        this.needRemoveBundle.length = 0;
        this.renderCommand.destroy();
        this.destRT = null;
    }
}