import { Laya } from "../../../../Laya";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext3D, PipelineMode } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderBundleManager } from "../RenderDevice/WebGPUBundle/WebGPURenderBundleManager";
import { WebGPURenderBundleManagerSet } from "../RenderDevice/WebGPUBundle/WebGPURenderBundleManagerSet";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPUContext } from "./WebGPUContext";
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

    private _viewScissorSaved: boolean = false;
    private _viewPortSave: Viewport = new Viewport();
    private _scissorSave: Vector4 = new Vector4();

    globalId: number;
    objectName: string = 'WebGPURenderContext3D';

    constructor() {
        this.globalId = WebGPUGlobal.getId(this);
        WebGPURenderEngine._instance.gpuBufferMgr.setRenderContext(this);
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
    }

    /**
     * 获取指令缓存组的key
     */
    getBundleManagerKey() {
        return this.cameraData.globalId + '_' + this.destRT.globalId;
    }

    /**
     * 渲染一组节点
     * @param list 
     */
    drawRenderElementList(list: FastSinglelist<WebGPURenderElement3D>): number {
        const len = list.length;
        if (len === 0) return 0; //没有需要渲染的对象
        //let tttt = performance.now();
        this._setScreenRT(); //如果没有渲染目标，则将屏幕作为渲染目标
        if (this._needStart) {
            this._start(); //为录制渲染命令做准备
            this._needStart = false;
        }

        //如果使用全局上下文，先清除上下文缓存
        if (WebGPUGlobal.useGlobalContext)
            WebGPUContext.startRender();

        //确定使用哪个绘图指令缓存
        let bundleManager: WebGPURenderBundleManager;
        let elementsToBundleStatic: WebGPURenderElement3D[];
        let elementsToBundleDynamic: WebGPURenderElement3D[];
        if (WebGPUGlobal.useBundle) {
            const bundleKey = this.getBundleManagerKey();
            let rbms = this.bundleManagerSets.get(bundleKey);
            if (!rbms) {
                rbms = new WebGPURenderBundleManagerSet();
                this.bundleManagerSets.set(bundleKey, rbms);
            }
            bundleManager = rbms.bundleManager;
            elementsToBundleStatic = rbms.elementsToBundleStatic;
            elementsToBundleDynamic = rbms.elementsToBundleDynamic;
        }
        //console.log('preTime =', (performance.now() - tttt), len);

        //tttt = performance.now();
        let compile = false;
        let createBundleCount = 0;
        const elements = list.elements;
        let element: WebGPURenderElement3D;
        for (let i = 0; i < len; i++) {
            element = elements[i];
            compile = element._preUpdatePre(this); //渲染前准备，如有必要，编译着色器
            if (WebGPUGlobal.useBundle) { //如果着色器重新编译，则清除相应的绘图指令缓存
                if (compile || element.staticChange) {
                    element.staticChange = false;
                    bundleManager.removeBundleByElement(element.bundleId);
                }
            }
        }
        //console.log('updateTime =', (performance.now() - tttt), len);

        //tttt = performance.now();
        if (WebGPUGlobal.useBundle) { //启用绘图指令缓存模式
            const needRemoveBundle = this.needRemoveBundle;
            for (let i = 0, n = needRemoveBundle.length; i < n; i++) //如果有需要清除的绘图指令缓存，先清除
                bundleManager.removeBundleByElement(needRemoveBundle[i]);
            needRemoveBundle.length = 0;
            bundleManager.removeLowShotBundle(); //清除低命中率的绘图指令缓存
            bundleManager.clearShot();
            const elementsMaxPerBundleStatic = bundleManager.elementsMaxPerBundleStatic;
            const elementsMaxPerBundleDynamic = bundleManager.elementsMaxPerBundleDynamic;
            for (let i = 0; i < len; i++) {
                element = elements[i];
                if (!bundleManager.has(element.bundleId)) { //如果该渲染节点没有在绘图指令缓存中
                    if (createBundleCount < 300) { //本帧是否允许创建绘图指令缓存（每帧只允许创建300个指令缓存，避免卡顿）
                        if (element.isStatic) {
                            if (elementsToBundleStatic.indexOf(element) === -1)
                                elementsToBundleStatic.push(element); //放入创建绘图指令缓存队列
                            if (elementsToBundleStatic.length >= elementsMaxPerBundleStatic) {
                                bundleManager.createBundle(this, elementsToBundleStatic, 0.7); //如果队列中的数量达到最大值，则创建批量绘图指令缓存
                                createBundleCount += elementsToBundleStatic.length;
                                elementsToBundleStatic.length = 0;
                            }
                        } else {
                            if (elementsToBundleDynamic.indexOf(element) === -1)
                                elementsToBundleDynamic.push(element); //放入创建绘图指令缓存队列
                            if (elementsToBundleDynamic.length >= elementsMaxPerBundleDynamic) {
                                bundleManager.createBundle(this, elementsToBundleDynamic, 1); //如果队列中的数量达到最大值，则创建批量绘图指令缓存
                                createBundleCount += elementsToBundleDynamic.length;
                                elementsToBundleDynamic.length = 0;
                            }
                        }
                    }
                    element._render(this, this.renderCommand, null); //因为还没有在绘图指令缓存中，先直接渲染
                } else {
                    this.bundleHit++;
                    element._render(this, null, null); //将该节点的shaderData数据上传到GPU
                }
            }
            if (elementsToBundleStatic.length >= elementsMaxPerBundleStatic / 2)
                bundleManager.createBundle(this, elementsToBundleStatic, 0.7);
            if (elementsToBundleDynamic.length >= elementsMaxPerBundleDynamic / 2)
                bundleManager.createBundle(this, elementsToBundleDynamic, 1);
            elementsToBundleStatic.length = 0;
            elementsToBundleDynamic.length = 0;
            bundleManager.renderBundles(this.renderCommand._encoder); //渲染所有绘图指令缓存
        } else { //不启用绘图指令缓存模式，直接绘制
            for (let i = 0; i < len; i++)
                elements[i]._render(this, this.renderCommand, null);
        }
        this._submit(); //提交渲染命令
        WebGPUStatis.addRenderElement(list.length); //统计渲染节点数量
        //console.log('renderTime =', (performance.now() - tttt), len);

        // tttt = performance.now();
        // for (let i = 0; i < len; i++)
        //     elements[i]._stateCheck(this);
        // console.log('stateTime =', (performance.now() - tttt), len);
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
        if (WebGPUGlobal.useGlobalContext)
            WebGPUContext.startRender();

        node._preUpdatePre(this);
        node._render(this, this.renderCommand, null);
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
            engine.screenResized = false;
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
        this.device = WebGPURenderEngine._instance.getDevice();
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
        if (this.blitScreen && WebGPURenderEngine._instance.screenResized) return; //屏幕尺寸改变，丢弃这一帧
        this.renderCommand.end();
        if (WebGPUGlobal.useBigBuffer)
            WebGPURenderEngine._instance.upload(); //上传所有Uniform数据
        this.device.queue.submit([this.renderCommand.finish()]);
        this._needStart = true;
        WebGPUStatis.addSubmit(); //统计提交次数

        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_DrawCallCount, 1);
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