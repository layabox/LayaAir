import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBindGroup } from "../RenderDevice/WebGPUBindGroupHelper";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

/**
 * WebGPU渲染上下文（2D）
 */
export class WebGPURenderContext2D implements IRenderContext2D {
    static _instance: WebGPURenderContext2D;
    static _globalConfigShaderData: WebDefineDatas;


    device: GPUDevice; //GPU设备

    sceneData: WebGPUShaderData;

    invertY: boolean = false;

    pipelineMode: string = 'Forward';

    _sceneBindGroup: WebGPUBindGroup;

    _cacheGlobalDefines: WebDefineDatas = new WebDefineDatas();

    renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器

    _destRT: WebGPUInternalRT;

    private _offscreenWidth: number;

    private _offscreenHeight: number;

    private _needClearColor: boolean;

    private _needStart: boolean = true;

    private _viewport: Viewport;

    private _clearColor: Color;

    constructor() {
        WebGPURenderContext2D._instance = this;
        WebGPURenderContext2D._globalConfigShaderData = Shader3D._configDefineValues;
        this.device = WebGPURenderEngine._instance.getDevice();
        this._clearColor = new Color();
        this._viewport = new Viewport();
    }


    /**@internal */
    _needGlobalData() {
        return !!this.sceneData;
    }

    private _prepareContext() {
        //shaderDefine
        let comDef = this._cacheGlobalDefines;
        if (this.sceneData) {
            this.sceneData._defineDatas.cloneTo(comDef);
        } else {
            WebGPURenderContext2D._globalConfigShaderData.cloneTo(comDef);
        }
        let returnGamma: boolean = !(this._destRT) || ((this._destRT)._textures[0].gammaCorrection != 1);
        if (returnGamma) {//这里为啥是反的？
            comDef.remove(ShaderDefines2D.GAMMASPACE);
        } else {
            comDef.add(ShaderDefines2D.GAMMASPACE);
        }

        if (this.invertY) {//这里为啥是反的？
            comDef.remove(ShaderDefines2D.INVERTY);
        } else {
            comDef.add(ShaderDefines2D.INVERTY);
        }

        if (this.sceneData) {
            let unifcom = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGlobal") as WebGPUCommandUniformMap;
            this.sceneData._createOrGetBindGroupbyUniformMap("Sprite2DGlobal", "Sprite2DGlobal", 0, unifcom._idata);
        }
    }

    getRenderTarget(): InternalRenderTarget {
        return this._destRT;
    }

    drawRenderElementList(list: FastSinglelist<WebGPURenderElement2D>): number {
        const len = list.length;
        if (len === 0) return 0; //没有需要渲染的对象

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
        this._needClearColor = clear;
        clearColor && clearColor.cloneTo(this._clearColor);
        if (this._destRT !== value) {
            this._destRT = value;
            this._needStart = true;
        }
        if (value)
            this._viewport.set(0, 0, value._textures[0].width, value._textures[0].height);
    }

    drawRenderElementOne(node: WebGPURenderElement2D): void {
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }
        this._prepareContext();
        //如果使用全局上下文，先清除上下文缓存
        // if (WebGPUGlobal.useGlobalContext)
        //     WebGPUContext.startRender();
        node._prepare(this);
        node._render(this, this.renderCommand);
        this._submit();
    }

    runOneCMD(cmd: IRenderCMD): void {
        cmd.apply(this);
    }

    runCMDList(cmds: IRenderCMD[]): void {
        cmds.forEach(cmd => cmd.apply(this));
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
            WebGPURenderEngine._instance._screenRT._textures[0].resource = WebGPURenderEngine._instance._context.getCurrentTexture();
            WebGPURenderEngine._instance._screenRT._textures[0].multiSamplers = 1;
            this.setRenderTarget(WebGPURenderEngine._instance._screenRT, this._needClearColor, this._clearColor);
        }
    }

    /**
     * 准备录制渲染命令
     */
    private _start() {
        this._setScreenRT();
        const renderPassDesc: GPURenderPassDescriptor
            = WebGPURenderPassHelper.getDescriptor(this._destRT, this._needClearColor ? RenderClearFlag.Color : RenderClearFlag.Nothing, this._clearColor);
        this.renderCommand.startRender(renderPassDesc);
        this.renderCommand.setViewport(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height, 0, 1);
        this._needClearColor = false;
    }
}