import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Viewport } from "../../../d3/math/Viewport";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D, PipelineMode } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/3DRenderPass/IRendderCMD";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { WebGPURenderPassHelper } from "../RenderDevice/WebGPURenderPassHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
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
    private _clearColor: Color = Color.RED;
    /**@internal */
    private _clearDepth: number;
    /**@internal */
    private _clearStencil: number;
    /**@internal */
    private _needStart: boolean = true;

    destRT: WebGPUInternalRT;
    renderCommand: WebGPURenderCommandEncoder = new WebGPURenderCommandEncoder();

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
        if (rt != this.destRT) {
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
        if (list.length == 0) return 0;
        if (!this.destRT) {
            const context = WebGPURenderEngine._instance._context;
            WebGPURenderEngine._instance._screenRT._textures[0].resource = context.getCurrentTexture();
            this.setRenderTarget(WebGPURenderEngine._instance._screenRT, RenderClearFlag.Color | RenderClearFlag.Depth);
        }
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }
        const elements = list.elements;
        for (let i = 0, n = list.length; i < n; i++)
            elements[i]._preUpdatePre(this);
        for (let i = 0, n = list.length; i < n; i++)
            elements[i]._render(this);
        this._submit();
        return 0;
    }

    drawRenderElementOne(node: WebGPURenderElement3D): number {
        if (!node) return 0;
        if (!this.destRT) {
            const context = WebGPURenderEngine._instance._context;
            WebGPURenderEngine._instance._screenRT._textures[0].resource = context.getCurrentTexture();
            this.setRenderTarget(WebGPURenderEngine._instance._screenRT, RenderClearFlag.Color | RenderClearFlag.Depth);
        }
        if (this._needStart) {
            this._start();
            this._needStart = false;
        }
        //node._preUpdatePre(this);
        //node._render(this);
        this._submit();
        return 0;
    }

    runOneCMD(cmd: IRenderCMD): void {
        cmd.apply(this);
    }

    runCMDList(cmds: IRenderCMD[]): void {
        cmds.forEach(cmd => cmd.apply(this));
    }

    private _start() {
        // const device = WebGPURenderEngine._instance.getDevice();
        // const context = WebGPURenderEngine._instance._context;
        // this.destRT._textures[0].resource = context.getCurrentTexture();
        const renderPassDesc: GPURenderPassDescriptor
           = WebGPURenderPassHelper.getDescriptor(this.destRT, this._clearFlag, this._clearColor, this._clearDepth, this._clearStencil);

        // // 创建命令编码器
        // const textureView = context.getCurrentTexture().createView();
        // const depthTexture = device.createTexture({
        //     size: { width: this._viewPort.width, height: this._viewPort.height, depthOrArrayLayers: 1 },
        //     format: 'depth24plus-stencil8',
        //     usage: GPUTextureUsage.RENDER_ATTACHMENT,
        // });

        // const renderPassDesc = {
        //     colorAttachments: [{
        //         view: this.destRT._textures[0].getTextureView(),
        //         loadOp: 'clear' as GPULoadOp,
        //         storeOp: 'store' as GPUStoreOp,
        //         clearValue: { r: 1, g: 0, b: 0, a: 1 },
        //     }],
        //     depthStencilAttachment: {
        //         view: this.destRT._depthTexture.getTextureView(),
        //         depthLoadOp: 'clear' as GPULoadOp,
        //         depthStoreOp: 'store' as GPUStoreOp,
        //         depthClearValue: 1,
        //         stencilLoadOp: 'clear' as GPULoadOp,
        //         stencilStoreOp: 'store' as GPUStoreOp,
        //         stencilClearValue: 0,
        //     }
        // };
        
        this.renderCommand.startRender(renderPassDesc);
        console.log(renderPassDesc);
        this._viewPort.x = 0;
        this._viewPort.y = 0;
        this.renderCommand.setViewport(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height, 0, 1);
        this.renderCommand.setScissorRect(this._scissor.x, this._scissor.y, this._scissor.z, this._scissor.w);
    }

    private _submit() {
        this.renderCommand.end();
        WebGPURenderEngine._instance.getDevice().queue.submit([this.renderCommand.finish()]);
        this._needStart = true;

        // const device = WebGPURenderEngine._instance.getDevice();
        // const context = WebGPURenderEngine._instance._context;

        // // 创建命令编码器
        // const commandEncoder = device.createCommandEncoder();
        // const textureView = context.getCurrentTexture().createView();
        // const depthTexture = device.createTexture({
        //     size: { width: this._viewPort.width, height: this._viewPort.height, depthOrArrayLayers: 1 },
        //     format: 'depth24plus-stencil8',
        //     usage: GPUTextureUsage.RENDER_ATTACHMENT,
        // });

        // const renderPassDescriptor = {
        //     colorAttachments: [{
        //         view: textureView,
        //         loadOp: 'clear' as GPULoadOp,
        //         storeOp: 'store' as GPUStoreOp,
        //         clearValue: { r: 0, g: 1, b: 0, a: 1 },
        //     }],
        //     depthStencilAttachment: {
        //         view: depthTexture.createView(),
        //         depthLoadOp: 'clear' as GPULoadOp,
        //         depthStoreOp: 'store' as GPUStoreOp,
        //         depthClearValue: 1,
        //         stencilLoadOp: 'clear' as GPULoadOp,
        //         stencilStoreOp: 'store' as GPUStoreOp,
        //         stencilClearValue: 0,
        //     }
        // };

        // // 开始渲染传递
        // const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        // passEncoder.end();

        // // 提交命令队列
        // device.queue.submit([commandEncoder.finish()]);
    }
}