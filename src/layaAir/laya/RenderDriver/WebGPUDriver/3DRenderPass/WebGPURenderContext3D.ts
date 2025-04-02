import { Laya } from "../../../../Laya";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { BaseCamera } from "../../../d3/core/BaseCamera";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext3D, PipelineMode } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBindGroup, WebGPUBindGroupHelper } from "../RenderDevice/WebGPUBindGroupHelper";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

/**
 * WebGPU渲染上下文
 */
export class WebGPURenderContext3D implements IRenderContext3D {
    /**@internal */
    _cacheGlobalDefines: WebDefineDatas = new WebDefineDatas();
    /**@internal */
    _globalConfigShaderData: WebDefineDatas;
    /**@internal */
    _preDrawUniformMaps: Set<string>;

    private _globalShaderData: WebGPUShaderData;

    private _sceneData: WebGPUShaderData;

    private _sceneModuleData: WebSceneNodeData;
    _sceneBindGroup: WebGPUBindGroup;

    private _cameraModuleData: WebCameraNodeData;
    _cameraBindGroup: WebGPUBindGroup;

    private _cameraData: WebGPUShaderData;

    private _viewPort: Viewport;

    private _scissor: Vector4;

    private _sceneUpdataMask: number = 0;

    private _cameraUpdateMask: number = 0;

    private _pipelineMode: PipelineMode;

    private _invertY: boolean;

    private _clearFlag: number;

    private _clearColor: Color = Color.BLACK.clone();

    private _clearDepth: number;

    private _clearStencil: number;

    private _needStart: boolean = true;

    private _blitFrameCount: number = 0; //渲染到屏幕时的帧序号,如果是帧刚开始，便清处上一帧数据

    private _blitScreen: boolean = false; //正在渲染到屏幕
    device: GPUDevice; //GPU设备
    destRT: WebGPUInternalRT; //渲染目标

    renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器

    private _viewScissorSaved: boolean = false;
    private _viewPortSave: Viewport = new Viewport();
    private _scissorSave: Vector4 = new Vector4();

    static _instance: WebGPURenderContext3D;

    constructor() {
        this.device = WebGPURenderEngine._instance.getDevice();
        this._preDrawUniformMaps = new Set<string>();
        WebGPURenderContext3D._instance = this;
    }

    get sceneData(): WebGPUShaderData {
        return this._sceneData;
    }

    set sceneData(value: WebGPUShaderData) {
        if (value == this._sceneData)
            return;
        this._sceneData = value;

        //重新绑定 
        if (value) {
            //global BindGroup
            let preDrawArray = Array.from(this._preDrawUniformMaps);
            let bindCacheKey = WebGPUBindGroupHelper._getBindGroupID(preDrawArray);
            let groupBindInfoArray = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, preDrawArray);
            this._sceneData._setBindGroupCacheInfo(bindCacheKey, groupBindInfoArray);
            if (this._sceneBindGroup) {
                this._sceneBindGroup.createMask = 0;
            }
            //buffer 
            let sceneMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap("Scene3D");
            this.sceneData.createUniformBuffer("Scene3D", sceneMap);
        }
    }

    get cameraData(): WebGPUShaderData {
        return this._cameraData;
    }

    set cameraData(value: WebGPUShaderData) {
        if (value == this._cameraData)
            return;
        if (value) {
            //camera bindGroup
            let preDrawArray = ["BaseCaemra"];
            let bindCacheKey = WebGPUBindGroupHelper._getBindGroupID(preDrawArray);
            this._cameraData = value;
            let groupBindInfoArray = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, preDrawArray);
            this._cameraData._setBindGroupCacheInfo(bindCacheKey, groupBindInfoArray);
            if (this._cameraBindGroup) {
                this._cameraBindGroup.createMask = 0;
            }
            //buffer
            let cameraMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseCamera");
            this.cameraData.createUniformBuffer("BaseCamera", cameraMap);

        }
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

    private _prepareContext() {
        let contextDef = this._cacheGlobalDefines;
        if (this._sceneData) {
            this._sceneData._defineDatas.cloneTo(contextDef);
            for (let key of this._preDrawUniformMaps) {
                this._sceneData.updateUBOBuffer(key);
            }
            //判断是否需要重新创建Scene的BindGroup
            let commandArray = Array.from(this._preDrawUniformMaps);
            let bindCacheKey = WebGPUBindGroupHelper._getBindGroupID(commandArray);
            if (!this._sceneBindGroup) {
                //直接创建
                this._sceneBindGroup = WebGPUBindGroupHelper.createBindGroupByCommandMapArray(0, commandArray, this._sceneData);
            } else {
                let lastUpdateMask = this._sceneData._getBindGroupLastUpdateMask(bindCacheKey);
                if (this._sceneBindGroup.isNeedCreate(lastUpdateMask)) {
                    this._sceneBindGroup = WebGPUBindGroupHelper.createBindGroupByCommandMapArray(0, commandArray, this._sceneData);
                }
            }
        } else {
            this._globalConfigShaderData.cloneTo(contextDef)
        }


        if (this.cameraData) {
            contextDef.addDefineDatas(this.cameraData._defineDatas);
            this.cameraData.updateUBOBuffer("BaseCamera");

            //判断是否需要重新准备Camera的BindGroup
            let commandArray = ["BaseCamera"];
            let bindCacheKey = WebGPUBindGroupHelper._getBindGroupID(commandArray);

            if (!this._cameraBindGroup) {
                //直接创建
                this._cameraBindGroup = WebGPUBindGroupHelper.createBindGroupByCommandMapArray(1, commandArray, this._cameraData);
            } else {
                let lastUpdateMask = this._cameraData._getBindGroupLastUpdateMask(bindCacheKey);
                if (this._cameraBindGroup.isNeedCreate(lastUpdateMask)) {
                    this._cameraBindGroup = WebGPUBindGroupHelper.createBindGroupByCommandMapArray(1, commandArray, this._cameraData);
                }
            }
        }
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
     * TODO 挪到外面
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
     * TODO 挪到外面
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
        this._prepareContext();
        const elements = list.elements;
        let element: WebGPURenderElement3D;
        for (let i = 0; i < len; i++) {
            element = elements[i];
            element._preUpdatePre(this); //渲染前准备，如有必要，编译着色器

        }
        WebGPURenderEngine._instance.gpuBufferMgr.upload();
        for (let i = 0; i < len; i++)
            elements[i]._render(this, this.renderCommand);

        this._submit(); //提交渲染命令
        //TODO 统计
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
        this._prepareContext();
        node._preUpdatePre(this);
        //数据更新
        WebGPURenderEngine._instance.gpuBufferMgr.upload();
        node._render(this, this.renderCommand);
        this._submit();
        //TODO 统计
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
            if (this._blitFrameCount === Laya.timer.currFrame)
                this.setRenderTarget(engine._screenRT, RenderClearFlag.Nothing);
            else this.setRenderTarget(engine._screenRT, RenderClearFlag.Color | RenderClearFlag.Depth);
            Color.BLACK.cloneTo(this._clearColor);
            this._blitFrameCount = Laya.timer.currFrame;
            this._blitScreen = true;
        } else this._blitScreen = false;
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
        if (this._blitScreen && engine._screenResized) return; //屏幕尺寸改变，丢弃这一帧
        this.renderCommand.end();
        engine.upload(); //上传Uniform数据
        this.device.queue.submit([this.renderCommand.finish()]);
        this._needStart = true;
        //WebGPUStatis.addSubmit(); //统计提交次数
        //TODO engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_DrawCallCount, 1);
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
        this.renderCommand.destroy();
        this.destRT = null;
    }
}