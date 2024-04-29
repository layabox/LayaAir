// import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
// import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
// import { Color } from "../../../maths/Color";
// import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
// import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
// import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
// import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
// import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
// import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
// import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
// import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
// import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
// import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
// import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

// export class WebGPURenderContext2D implements IRenderContext2D {
//     private _clearColor: Color = new Color(0, 0, 0, 0);
//     _destRT: InternalRenderTarget;
//     invertY: boolean = false;
//     pipelineMode: string = 'Forward';
//     sceneData: WebGPUShaderData;
//     cameraData: WebGPUShaderData;
//     _globalConfigShaderData: WebDefineDatas;

//     private _needStart: boolean = true;
//     private _offscreenWidth: number;
//     private _offscreenHeight: number;

//     device: GPUDevice; //GPU设备
//     destRT: WebGPUInternalRT; //渲染目标
//     renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器

//     constructor() {
//         this._globalConfigShaderData = Shader3D._configDefineValues;
//     }

//     setOffscreenView(width: number, height: number): void {
//         this._offscreenWidth = width;
//         this._offscreenHeight = height;
//     }

//     setRenderTarget(rt: WebGPUInternalRT, clear: boolean, clearColor: Color): void {
//         if (rt !== this.destRT) {
//             this.destRT = rt;
//             this._needStart = true;
//         }
//     }

//     drawRenderElementOne(node: WebGPURenderElement2D): void {
//         return;
//         this._setScreenRT();
//         if (this._needStart) {
//             this._start();
//             this._needStart = false;
//         }
//         node.prepare(this);
//         node.render(this, this.renderCommand);
//         this._submit();
//     }

//     /**
//      * 设置屏幕渲染目标
//      */
//     private _setScreenRT() {
//         if (!this.destRT) { //如果渲染目标为空，设置成屏幕渲染目标，绘制到画布上
//             const engine = WebGPURenderEngine._instance;
//             engine.screenResized = false;
//             engine._screenRT._textures[0].resource = engine._context.getCurrentTexture();
//             engine._screenRT._textures[0].multiSamplers = 1;
//             this.setRenderTarget(engine._screenRT, false, Color.BLACK);
//         }
//     }

//     /**
//      * 准备录制渲染命令
//      */
//     private _start() {
//         this.device = WebGPURenderEngine._instance.getDevice();
//         const renderPassDesc: GPURenderPassDescriptor
//             = WebGPURenderPassHelper.getDescriptor(this.destRT, RenderClearFlag.Nothing);
//         this.renderCommand.startRender(renderPassDesc);
//     }

//     /**
//      * 提交渲染命令
//      */
//     private _submit() {
//         this.renderCommand.end();
//         if (WebGPUGlobal.useBigBuffer)
//             WebGPURenderEngine._instance.upload(); //上传所有Uniform数据
//         this.device.queue.submit([this.renderCommand.finish()]);
//         this._needStart = true;
//         WebGPUStatis.addSubmit(); //统计提交次数
//     }
// }

import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Viewport } from "../../../maths/Viewport";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../RenderDevice/WebGPUStatis/WebGPUStatis";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

export class WebGPURenderContext2D implements IRenderContext2D {
    private _clearColor: Color = new Color(0, 0, 0, 0);
    destRT: WebGPUInternalRT;
    invertY: boolean = false;
    pipelineMode: string = 'Forward';
    sceneData: WebGPUShaderData = new WebGPUShaderData();
    cameraData: WebGPUShaderData = new WebGPUShaderData();
    _globalConfigShaderData: WebDefineDatas;
    renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder(); //渲染命令编码器
    private _offscreenWidth: number;
    private _offscreenHeight: number;
    private _needClearColor: boolean;
    private _needStart: boolean = true;
    private _viewport: Viewport;
    device: GPUDevice; //GPU设备

    constructor() {
        this._globalConfigShaderData = Shader3D._configDefineValues;
        this._clearColor = new Color();
        this._viewport = new Viewport();
    }

    setOffscreenView(width: number, height: number): void {
        this._offscreenWidth = width;
        this._offscreenHeight = height;
    }

    setRenderTarget(value: WebGPUInternalRT, clear: boolean, clearColor: Color): void {
        this._needClearColor = clear;
        clearColor && clearColor.cloneTo(this._clearColor);
        if (value !== this.destRT) {
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
        node.prepare(this);
        node.render(this, this.renderCommand);
        this._submit();
    }

    /**
     * 提交渲染命令
     */
    private _submit() {
        this.renderCommand.end();
        if (WebGPUGlobal.useBigBuffer)
            WebGPURenderEngine._instance.upload(); //上传所有Uniform数据
        this.device.queue.submit([this.renderCommand.finish()]);
        this._needStart = true;
        WebGPUStatis.addSubmit(); //统计提交次数
    }

    /**
     * 设置屏幕渲染目标
     */
    private _setScreenRT() {
        if (!this.destRT) { //如果渲染目标为空，设置成屏幕渲染目标，绘制到画布上
            const context = WebGPURenderEngine._instance._context;
            WebGPURenderEngine._instance._screenRT._textures[0].resource = context.getCurrentTexture();
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
    }
}