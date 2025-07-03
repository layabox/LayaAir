import { Laya } from "../../../../Laya";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { Stat } from "../../../utils/Stat";
import { IRenderContext3D, PipelineMode } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBindGroup } from "../RenderDevice/WebGPUBindGroupCache";
import { WebGPUBindGroupHelper } from "../RenderDevice/WebGPUBindGroupHelper";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPUGlobalPipeLineCacheInfo } from "../RenderDevice/WebGPURenderDeviceFactory";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";


/**
 * WebGPU渲染上下文
 */
export class WebGPURenderContext3D implements IRenderContext3D {

    static _instance: WebGPURenderContext3D;

    private _globalComkeyCounter: number = 0;

    private _globalComkeyNameMap: any = {};

    private _globalRendercacheInfoMap: Map<number, WebGPUGlobalPipeLineCacheInfo> = new Map();


    private _globalShaderData: WebGPUShaderData;

    private _sceneData: WebGPUShaderData;

    private _sceneModuleData: WebSceneNodeData;

    private _cameraModuleData: WebCameraNodeData;

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

    private _viewScissorSaved: boolean = false;

    private _viewPortSave: Viewport = new Viewport();

    private _scissorSave: Vector4 = new Vector4();

    private _renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器

    _cacheGlobalDefines: WebDefineDatas = new WebDefineDatas();

    _globalConfigShaderData: WebDefineDatas;

    _preDrawUniformMaps: Set<string>;

    //CacheData
    _cameraBindGroup: WebGPUBindGroup;
    _sceneBindGroup: WebGPUBindGroup;
    _curRenderCacheInfo: WebGPUGlobalPipeLineCacheInfo;
    _curRenderGlobalKey: number;
    _curDefineChangeFlag: Vector2;
    _pipelineChange: Vector2;

    device: GPUDevice; //GPU设备

    destRT: WebGPUInternalRT; //渲染目标

    get sceneData(): WebGPUShaderData {
        return this._sceneData;
    }

    set sceneData(value: WebGPUShaderData) {
        if (value == this._sceneData)
            return;
        this._sceneData = value;

        //重新绑定 
        if (value) {
            for (let key of this._preDrawUniformMaps) {
                let uniformMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                if (uniformMap._idata.size > 0) {
                    this.sceneData.createSubUniformBuffer(key, key, uniformMap._idata);
                }
            }
        }
    }

    get cameraData(): WebGPUShaderData {
        return this._cameraData;
    }

    set cameraData(value: WebGPUShaderData) {
        if (value == this._cameraData)
            return;
        if (value) {
            this._cameraData = value;
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

    rtNeedClear: boolean = false;

    constructor() {
        this.device = WebGPURenderEngine._instance.getDevice();
        this._preDrawUniformMaps = new Set<string>();
        WebGPURenderContext3D._instance = this;
    }

    //全局组合生成的id
    private globalComkeyToID(name: string): number {
        if (this._globalComkeyNameMap[name] !== undefined) {
            return this._globalComkeyNameMap[name];
        } else {
            const id = this._globalComkeyCounter++;
            this._globalComkeyNameMap[name] = id;
            return id;
        }
    }

    private _getRenderPipeLine(): string {
        const engine = WebGPURenderEngine._instance;

        let sceneCommands = Array.from(this._preDrawUniformMaps);
        let sceneResources = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, sceneCommands);
        let sceneLayoutInfo = engine.bindGroupCache.getLayoutInfo(sceneCommands, this._sceneData, null, sceneResources, ~0);

        let cameraCommands = ["BaseCamera"];
        let cameraResources = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, cameraCommands);
        let cameraLayoutInfo = engine.bindGroupCache.getLayoutInfo(cameraCommands, this.cameraData, null, cameraResources, ~0);

        //根据sceneShaderData+
        return `${this.destRT.stateCacheID},${this.invertY ? 1 : 0},(${sceneLayoutInfo.id},${cameraLayoutInfo.id})`;
    }

    private _getSceneCameraCacheKey() {
        let key: string = `${this.sceneData._id ? this.sceneData._id : -1} + ${this.cameraData ? this.cameraData._id : -1}+${this._pipelineMode}+${this.destRT == WebGPURenderEngine._instance._screenRT ? 0 : 1}`;
        this._curRenderGlobalKey = this.globalComkeyToID(key);
        let pipelineLayout = this._getRenderPipeLine();
        if (!this._globalRendercacheInfoMap.has(this._curRenderGlobalKey)) {
            let cacheInfo = new WebGPUGlobalPipeLineCacheInfo();
            this._curRenderCacheInfo = cacheInfo;
            this._cacheGlobalDefines.cloneTo(cacheInfo.globalDefineData);
            this._curRenderCacheInfo.globalDefineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            cacheInfo.pipeLineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            cacheInfo.globalPipelineCacheKey = pipelineLayout;
            this._globalRendercacheInfoMap.set(this._curRenderGlobalKey, cacheInfo);
        } else {
            this._curRenderCacheInfo = this._globalRendercacheInfoMap.get(this._curRenderGlobalKey);
            if (this._curRenderCacheInfo.globalPipelineCacheKey == pipelineLayout) {
                this._pipelineChange = this._curRenderCacheInfo.pipeLineChangeFlag;
            } else {
                this._pipelineChange = this._curRenderCacheInfo.pipeLineChangeFlag;
                this._curRenderCacheInfo.globalPipelineCacheKey = pipelineLayout;
                this._curRenderCacheInfo.pipeLineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            }

            if (!this._curRenderCacheInfo.globalDefineData.isEual(this._cacheGlobalDefines)) {
                this._cacheGlobalDefines.cloneTo(this._curRenderCacheInfo.globalDefineData);
                this._curRenderCacheInfo.globalDefineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount)
            }
        }
        this._curDefineChangeFlag = this._curRenderCacheInfo.globalDefineChangeFlag
    }

    private _prepareContext() {
        let contextDef = this._cacheGlobalDefines;// = passDef;//this._cacheGlobalDefines;
        if (this._sceneData) {
            this._sceneData._defineDatas.cloneTo(contextDef);

            for (let key of this._preDrawUniformMaps) {
                let uniformMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                if (uniformMap._idata.size > 0) {
                    let buffer = this.sceneData.createSubUniformBuffer(key, key, uniformMap._idata);
                    buffer.upload();
                }
            }

            let commandArray = Array.from(this._preDrawUniformMaps);

            let resource = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, commandArray)
            this._sceneBindGroup = (LayaGL.renderEngine as WebGPURenderEngine).bindGroupCache.getBindGroup(commandArray, this._sceneData, null, resource, ~0);
        }
        else {
            this._globalConfigShaderData.cloneTo(contextDef)
        }

        if (this.cameraData) {
            contextDef.addDefineDatas(this.cameraData._defineDatas);

            let cameraMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseCamera");
            let cameraBuffer = this.cameraData.createUniformBuffer("BaseCamera", cameraMap);
            if (cameraBuffer) {
                cameraBuffer.upload();
            }

            //判断是否需要重新准备Camera的BindGroup
            let commandArray = ["BaseCamera"];

            let resource = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(1, commandArray);

            this._cameraBindGroup = (LayaGL.renderEngine as WebGPURenderEngine).bindGroupCache.getBindGroup(commandArray, this.cameraData, null, resource, ~0);
        }
        this._getSceneCameraCacheKey();
    }

    /**
     * 设置屏幕渲染目标
     */
    private _setScreenRT() {
        if (!this.destRT) { //如果渲染目标为空，设置成屏幕渲染目标，绘制到画布上
            const engine = WebGPURenderEngine._instance;
            engine._screenResized = false;
            if (this._blitFrameCount === Laya.timer.currFrame) {
                this.setRenderTarget(engine._screenRT, RenderClearFlag.Nothing);
            }
            else {
                this.setRenderTarget(engine._screenRT, RenderClearFlag.Color | RenderClearFlag.Depth);
                engine.hasScreenCleared = true; //标记屏幕已清除
            }
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
        this._renderCommand.startRender(renderPassDesc);
        this._clearFlag = RenderClearFlag.Nothing;
        if (viewPortAndScissor) {
            if (this._viewPort) {
                this._viewPort.y = this._viewPort.y | 0; //有时候会传进来小数
                this._viewPort.width = this._viewPort.width | 0;
                this._viewPort.height = this._viewPort.height | 0;
                this._renderCommand.setViewport(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height, 0, 1);
            }
            if (this._scissor) {
                this._scissor.y = this._scissor.y | 0;
                this._renderCommand.setScissorRect(this._scissor.x, this._scissor.y, this._scissor.z, this._scissor.w);
            }
        }
    }

    /**
     * 提交渲染命令
     */
    private _submit() {
        const engine = WebGPURenderEngine._instance;
        if (this._blitScreen && engine._screenResized) return; //屏幕尺寸改变，丢弃这一帧
        this._renderCommand.end();
        engine.upload(); //上传Uniform数据
        this.device.queue.submit([this._renderCommand.finish()]);
        this._needStart = true;
    }

    /**
     * 设置渲染目标
     * @param rt 
     * @param clearFlag 
     */
    setRenderTarget(rt: WebGPUInternalRT, clearFlag: RenderClearFlag): void {
        if (rt !== this.destRT) {
            this._clearFlag = clearFlag;
            this.destRT = rt;
            this._needStart = true;
        }
        else {
            if (!this.rtNeedClear) {
                this._clearFlag = clearFlag;
            }
            else {
                if (clearFlag != RenderClearFlag.Nothing) {
                    this._clearFlag |= clearFlag;
                }
            }
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

        if (this.rtNeedClear) {
            if (flag == RenderClearFlag.Nothing) {

            }
            else if (flag & RenderClearFlag.Color) {
                this._clearFlag |= RenderClearFlag.Color;
                color.cloneTo(this._clearColor);
            }
            else if (flag & RenderClearFlag.Depth) {
                this._clearFlag |= RenderClearFlag.Depth;
                this._clearDepth = depth;
            }
            else if (flag & RenderClearFlag.Stencil) {
                this._clearFlag |= RenderClearFlag.Stencil;
                this._clearStencil = stencil;
            }
        }
        else {
            this._clearFlag = flag;
            this._clearDepth = depth;
            this._clearStencil = stencil;
            color.cloneTo(this._clearColor);
        }

        if (flag != RenderClearFlag.Nothing) {
            this.rtNeedClear = true;
        }

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
        this._prepareContext();

        const elements = list.elements;
        let element: WebGPURenderElement3D;
        for (let i = 0; i < len; i++) {
            element = elements[i];
            element._preUpdatePre(this); //渲染前准备，如有必要，编译着色器
        }

        WebGPURenderEngine._instance.gpuBufferMgr.upload();


        if (this._needStart) {
            this._start(); //为录制渲染命令做准备
            this._needStart = false;
        }

        let cmd = this._renderCommand;
        cmd.setBindGroup(0, this._sceneBindGroup);
        cmd.setBindGroup(1, this._cameraBindGroup);

        for (let i = 0; i < len; i++)
            elements[i]._render(this, cmd);

        this._submit(); //提交渲染命令

        this.rtNeedClear = false;

        //TODO 统计
        WebGPURenderEngine._instance._framePassCount++;
        return 0;
    }

    /**
     * 渲染一个节点
     * @param node 
     */
    drawRenderElementOne(node: WebGPURenderElement3D): number {

        this._setScreenRT();
        this._prepareContext();
        node._preUpdatePre(this);
        //数据更新
        WebGPURenderEngine._instance.gpuBufferMgr.upload();


        if (this._needStart) {
            this._start();
            this._needStart = false;
        }
        this._renderCommand.setBindGroup(0, this._sceneBindGroup)
        this._renderCommand.setBindGroup(1, this._cameraBindGroup)
        node._render(this, this._renderCommand);
        this._submit();
        this.rtNeedClear = false;
        WebGPURenderEngine._instance._framePassCount++;
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
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
        this._renderCommand.destroy();
        this.destRT = null;
    }
}
