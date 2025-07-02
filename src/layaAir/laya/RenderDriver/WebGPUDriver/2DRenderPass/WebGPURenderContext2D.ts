import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { Stat } from "../../../utils/Stat";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
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
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPUUniformBufferBase } from "../RenderDevice/WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

/**
 * WebGPU渲染上下文（2D）
 */
export class WebGPURenderContext2D implements IRenderContext2D {
    static _instance: WebGPURenderContext2D;
    static _globalConfigShaderData: WebDefineDatas;

    private _globalComkeyCounter: number = 0;

    private _globalComkeyNameMap: any = {};

    private _globalRendercacheInfoMap: Map<number, WebGPUGlobalPipeLineCacheInfo> = new Map();

    private _passData: WebGPUShaderData;

    private _offscreenWidth: number;

    private _offscreenHeight: number;

    private _needClearColor: boolean;

    private _needStart: boolean = true;

    private _viewport: Viewport;

    private _clearColor: Color;

    private renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器

    private _passUniformBuffer: WebGPUUniformBufferBase;

    _cacheGlobalDefines: WebDefineDatas = new WebDefineDatas();

    _destRT: WebGPUInternalRT;

    invertY: boolean = false;

    pipelineMode: string = 'Forward';

    device: GPUDevice; //GPU设备

    //cacheData
    _passBindGroup: WebGPUBindGroup;
    _curRenderCacheInfo: WebGPUGlobalPipeLineCacheInfo;
    _curRenderGlobalKey: number;
    _curDefineChangeFlag: Vector2;
    _pipelineChange: Vector2;

    get passData(): WebGPUShaderData {
        return this._passData;
    }

    set passData(value: WebGPUShaderData) {
        if (value == this._passData)
            return;
        this._passData = value;
        if (value) {
            let unifcom = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGlobal") as WebGPUCommandUniformMap;
            this._passUniformBuffer = this.passData.createUniformBuffer("Sprite2DGlobal", unifcom);
        } else {
            this._passUniformBuffer = null;
        }
    }

    constructor() {
        WebGPURenderContext2D._instance = this;
        WebGPURenderContext2D._globalConfigShaderData = Shader3D._configDefineValues as WebDefineDatas;
        this.device = WebGPURenderEngine._instance.getDevice();
        this._clearColor = new Color();
        this._viewport = new Viewport();
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

    private _getPassCacheKey() {
        let key: string = `${this.passData ? this.passData._id : -1},+${this._destRT == WebGPURenderEngine._instance._screenRT ? 0 : 1}`;
        this._curRenderGlobalKey = this.globalComkeyToID(key);
        let pipelineLayout = this._getRenderPipeLine();
        if (!this._globalRendercacheInfoMap.has(this._curRenderGlobalKey)) {
            let cacheInfo = new WebGPUGlobalPipeLineCacheInfo();
            this._curRenderCacheInfo = cacheInfo;
            this._cacheGlobalDefines.cloneTo(cacheInfo.globalDefineData);
            this._curRenderCacheInfo.globalDefineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount)
            cacheInfo.globalPipelineCacheKey = pipelineLayout;
            cacheInfo.pipeLineChangeFlag.setValue(Stat.loopCount, WebGPURenderEngine._instance._framePassCount);
            this._pipelineChange = cacheInfo.pipeLineChangeFlag;
            this._globalRendercacheInfoMap.set(this._curRenderGlobalKey, cacheInfo)
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

    private _getRenderPipeLine(): string {
        if (this.passData) {
            const engine = WebGPURenderEngine._instance;
            let globalCommand = ["Sprite2DGlobal"];
            let globalResource = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, globalCommand);
            let globalLayoutInfo = engine.bindGroupCache.getLayoutInfo(globalCommand, this.passData, null, globalResource, ~0);
            return `${this._destRT.stateCacheID},(${globalLayoutInfo.id})`;
        } else {
            return `${this._destRT.stateCacheID},(null)`
        }
    }



    private _prepareContext() {
        //shaderDefine
        let comDef = this._cacheGlobalDefines;
        if (this.passData) {
            this.passData._defineDatas.cloneTo(comDef);
            this._passUniformBuffer.upload();
            let commandArray = ["Sprite2DGlobal"];
            let resource = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(0, commandArray);
            this._passBindGroup = (LayaGL.renderEngine as WebGPURenderEngine).bindGroupCache.getBindGroup(commandArray, this._passData, null, resource, ~0);
        } else {
            WebGPURenderContext2D._globalConfigShaderData.cloneTo(comDef);
            this._passBindGroup = WebGPURenderEngine._instance.bindGroupCache.getBindGroup([], null, null, [], 0);
        }
        let returnGamma: boolean = !(this._destRT) || ((this._destRT)._textures[0].gammaCorrection != 1);
        if (this._destRT == WebGPURenderEngine._instance._screenRT) {
            returnGamma = true;
        }
        if (returnGamma) {
            comDef.add(ShaderDefines2D.GAMMASPACE);
        } else {
            comDef.remove(ShaderDefines2D.GAMMASPACE);
        }


        if (this.invertY) {//这里为啥是反的？
            comDef.remove(ShaderDefines2D.INVERTY);
        } else {
            comDef.add(ShaderDefines2D.INVERTY);
        }
        this._getPassCacheKey();

    }

    /**
 * 提交渲染命令
 */
    private _submit() {
        const engine = WebGPURenderEngine._instance;
        this.renderCommand.end();
        engine.upload(); //上传Uniform数据
        this.device.queue.submit([this.renderCommand.finish()]);
        this._needStart = true;
        WebGPUStatis.addSubmit(); //统计提交次数
    }

    /**
     * 设置屏幕渲染目标
     */
    private _setScreenRT() {
        if (!this._destRT) { //如果渲染目标为空，设置成屏幕渲染目标，绘制到画布上
            this.setRenderTarget(null, this._needClearColor, this._clearColor);
        }
    }

    /**
     * 准备录制渲染命令
     */
    private _start() {
        this._setScreenRT();
        this._destRT = this._destRT || WebGPURenderEngine._instance._screenRT;
        const renderPassDesc: GPURenderPassDescriptor
            = WebGPURenderPassHelper.getDescriptor(this._destRT, this._needClearColor ? RenderClearFlag.Color : RenderClearFlag.Nothing, this._clearColor);
        this.renderCommand.startRender(renderPassDesc);
        this.renderCommand.setViewport(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height, 0, 1);
        this._needClearColor = false;
    }

    /**@internal */
    _needGlobalData() {
        return !!this.passData;
    }

    getRenderTarget(): InternalRenderTarget {
        return this._destRT;
    }

    drawRenderElementList(list: FastSinglelist<WebGPURenderElement2D>): number {
        const len = list.length;
        if (len === 0) return 0; //没有需要渲染的对象
        WebGPURenderEngine._instance._framePassCount++;
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }
        this._prepareContext();

        const elements = list.elements;
        for (let i = 0, n = list.length; i < n; i++) {
            elements[i]._prepare(this);
        }
        WebGPURenderEngine._instance.gpuBufferMgr.upload();
        for (let i = 0, n = list.length; i < n; i++) {
            elements[i]._render(this, this.renderCommand);
        }
        this._submit();
        return 0;
    }

    setOffscreenView(width: number, height: number): void {
        this._offscreenWidth = width;
        this._offscreenHeight = height;
    }

    setRenderTarget(value: WebGPUInternalRT, clear: boolean, clearColor: Color): void {
        const engine = WebGPURenderEngine._instance;

        if (!this._needClearColor) {
            this._needClearColor = clear;
        }
        if (clear) {
            clearColor && clearColor.cloneTo(this._clearColor);
        }

        if (engine.hasScreenCleared) {
            this._needClearColor = false;
        }

        if (!value || this._destRT !== value) {
            this._destRT = value;
            this._needStart = true;
        }

        let rt = value;

        if (!rt) {
            // 如果没有设置渲染目标，则使用屏幕渲染目标
            rt = engine._screenRT;
        }
        let tex = rt._textures[0];
        this._viewport.set(0, 0, tex.width, tex.height);
    }

    drawRenderElementOne(node: WebGPURenderElement2D): void {
        WebGPURenderEngine._instance._framePassCount++;
        this._prepareContext();
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }

        node._prepare(this);
        WebGPURenderEngine._instance.gpuBufferMgr.upload();
        node._render(this, this.renderCommand);
        this._submit();
    }

    runOneCMD(cmd: IRenderCMD): void {
        cmd.apply(this);
    }

    runCMDList(cmds: IRenderCMD[]): void {
        cmds.forEach(cmd => cmd.apply(this));
    }


}