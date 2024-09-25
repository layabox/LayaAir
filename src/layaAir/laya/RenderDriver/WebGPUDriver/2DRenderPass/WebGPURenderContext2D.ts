import { Laya } from "../../../../Laya";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUContext } from "../3DRenderPass/WebGPUContext";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

/**
 * WebGPU渲染上下文（2D）
 */
export class WebGPURenderContext2D implements IRenderContext2D {
    device: GPUDevice; //GPU设备
    destRT: WebGPUInternalRT;
    invertY: boolean = false;
    pipelineMode: string = 'Forward';
    sceneData: WebGPUShaderData = new WebGPUShaderData();
    cameraData: WebGPUShaderData = new WebGPUShaderData();
    _globalConfigShaderData: WebDefineDatas;
    renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器
    pipelineCache: any[] = []; //所有的2D渲染管线缓存

    private _offscreenWidth: number;
    private _offscreenHeight: number;
    private _needClearColor: boolean;
    private _needStart: boolean = true;
    private _viewport: Viewport;
    private _clearColor: Color;

    constructor() {
        this._globalConfigShaderData = Shader3D._configDefineValues;
        this._clearColor = new Color();
        this._viewport = new Viewport();
    }

    drawRenderElementList(list: FastSinglelist<WebGPURenderElement2D>): number {
        const len = list.length;
        if (len === 0) return 0; //没有需要渲染的对象

        if (this._needStart) {
            this._start();
            this._needStart = false;
        }

        //如果使用全局上下文，先清除上下文缓存
        if (WebGPUGlobal.useGlobalContext)
            WebGPUContext.startRender();

        for (let i = 0, n = list.length; i < n; i++) {
            list.elements[i].prepare(this);
            list.elements[i].render(this, this.renderCommand);
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
        if (this.destRT !== value) {
            this.destRT = value;
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

        //如果使用全局上下文，先清除上下文缓存
        if (WebGPUGlobal.useGlobalContext)
            WebGPUContext.startRender();

        node.prepare(this);
        node.render(this, this.renderCommand);
        this._submit();
    }

    /**
     * 提交渲染命令
     */
    private _submit() {
        const engine = WebGPURenderEngine._instance;
        this.renderCommand.end();
        if (Laya.timer.currFrame != engine.frameCount) {
            engine.frameCount = Laya.timer.currFrame;
            engine.startFrame();
        }
        if (WebGPUGlobal.useBigBuffer)
            engine.upload(); //上传所有Uniform数据
        this.device.queue.submit([this.renderCommand.finish()]);
        this._needStart = true;
        WebGPUStatis.addSubmit(); //统计提交次数
    }

    /**
     * 设置屏幕渲染目标
     */
    private _setScreenRT() {
        if (!this.destRT) { //如果渲染目标为空，设置成屏幕渲染目标，绘制到画布上
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
        this.device = WebGPURenderEngine._instance.getDevice();
        const renderPassDesc: GPURenderPassDescriptor
            = WebGPURenderPassHelper.getDescriptor(this.destRT, this._needClearColor ? RenderClearFlag.Color : RenderClearFlag.Nothing, this._clearColor);
        this.renderCommand.startRender(renderPassDesc);
        this.renderCommand.setViewport(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height, 0, 1);
        this._needClearColor = false;
    }
}