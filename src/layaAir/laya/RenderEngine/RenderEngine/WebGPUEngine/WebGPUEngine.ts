import { WGPUShaderData } from "../../../d3/RenderObjs/WebGPUOBJ/WGPUShaderData";
import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { BufferTargetType, BufferUsage } from "../../RenderEnum/BufferTargetType";
import { RenderCapable } from "../../RenderEnum/RenderCapable";
import { RenderClearFlag } from "../../RenderEnum/RenderClearFlag";
import { RenderParams } from "../../RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../../RenderEnum/RenderStatInfo";
import { IRender2DContext } from "../../RenderInterface/IRender2DContext";
import { IRenderDrawContext } from "../../RenderInterface/IRenderDrawContext";
import { IRenderEngine } from "../../RenderInterface/IRenderEngine";
import { IRenderOBJCreate } from "../../RenderInterface/IRenderOBJCreate";
import { IRenderShaderInstance } from "../../RenderInterface/IRenderShaderInstance";
import { IRenderVertexState } from "../../RenderInterface/IRenderVertexState";
import { ShaderDataType } from "../../RenderShader/ShaderData";
import { RenderStateCommand } from "../../RenderStateCommand";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { WebGPUConfig } from "./WebGPUConfig";
import { WebGPURenderPassDescriptor } from "./WebGPURenderPassDescriptor";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPUSamplerContext } from "./WebGPUSamplerContext";
import { WebGPUTextureContext } from "./WebGPUTextureContext";
import { GPUBUfferUsage } from "./WebGPUBuffer";
import { WebGPUCapable } from "./WebGPUCapable";
import { RenderTargetFormat } from "../../RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../../RenderEnum/TextureDimension";
import { WGPUBindGroupHelper } from "./WGPUBindGroupHelper";
import { WGPURenderPipeline } from "../../../d3/RenderObjs/WebGPUOBJ/WebGPURenderPipelineHelper";

export class WebGPUEngine implements IRenderEngine {
    _canvas: HTMLCanvasElement;
    _context: GPUCanvasContext;
    _isShaderDebugMode: boolean;
    _renderOBJCreateContext: IRenderOBJCreate;
    /**@internal */
    _IDCounter: number = 0;
    //bind viewport
    private _lastViewport: Vector4;
    private _lastScissor: Vector4;

    //TODO
    private _enableScissor: boolean;
    //GPU统计数据
    private _GLStatisticsInfo: Map<RenderStatisticsInfo, number> = new Map();


    private _adapter: GPUAdapter;
    private _adapterSupportedExtensions: GPUFeatureName[];

    _device: GPUDevice;
    private _deviceEnabledExtensions: GPUFeatureName[];


    _config: WebGPUConfig;


    //Buffer destroyBuffer
    _deferredDestroyBuffers: WebGPUBuffer[] = [];
    //Texture Destroy
    _deferredDestroyTextures: WebGPUInternalTex[] = [];
    //Sampler Destroy
    _samplerContext: WebGPUSamplerContext;

    _webGPUTextureContext: WebGPUTextureContext;
    _cavansRT: WebGPUInternalRT;
    /**@internal */
    private _propertyNameMap: any = {};
    /**@internal */
    private _propertyNameCounter: number = 0;
    /**
    * @internal
    * 支持功能
    */
    _supportCapatable: WebGPUCapable;
    /**
     * 实例化一个webgpuEngine
     */
    constructor(config: WebGPUConfig, canvas: any) {
        this._canvas = canvas;
        this._config = config;
        this._lastViewport = new Vector4(0, 0, 0, 0);
        //this._lastClearColor = new Color(0, 0, 0, 0);
        this._lastScissor = new Vector4(0, 0, 0, 0);
        if (!navigator.gpu) {
            console.error("WebGPU is not supported by your browser.");
            return;
        }


    }

    /**
     * get adapter by computer
     * @returns 
     */
    private _getAdapter(): Promise<GPUAdapter> {
        return navigator.gpu!.requestAdapter({ powerPreference: this._config.powerPreference });
    }

    /**
     * init Adapter
     * @param adapter 
     */
    _initAdapter(adapter: GPUAdapter) {
        if (!adapter) {
            throw "Could not retrieve a WebGPU adapter (adapter is null).";
        } else {
            this._adapter = adapter;
            const deviceDescriptor = this._config.deviceDescriptor;
            this._adapterSupportedExtensions = [];
            this._adapter.features?.forEach((feature) => this._adapterSupportedExtensions.push(feature as GPUFeatureName));
            if (deviceDescriptor?.requiredFeatures) {
                const requestedExtensions = deviceDescriptor.requiredFeatures;
                const validExtensions: GPUFeatureName[] = [];
                for (const extension of requestedExtensions) {
                    if (this._adapterSupportedExtensions.indexOf(extension) !== -1) {
                        validExtensions.push(extension);
                    }
                }
                deviceDescriptor.requiredFeatures = validExtensions;
            }
        }
    }

    /**
     * get GPUDevice
     * @param deviceDescriptor 
     * @returns 
     */
    private _getGPUdevice(deviceDescriptor: GPUDeviceDescriptor): Promise<GPUDevice> {
        return this._adapter.requestDevice(deviceDescriptor);
    }

    /**
     * get init Device info
     * @param device 
     */
    private _initGPUDevice(device: GPUDevice) {
        this._device = device;
        this._deviceEnabledExtensions = [];
        this._device.features.forEach(element => {
            this._deviceEnabledExtensions.push(element as GPUFeatureName);
        });
        this._device.addEventListener("uncapturederror", this._uncapturederrorCall);
        this._device.lost.then(this._deviceLostCall);
    }

    /**
     * error handle
     * @param event 
     */
    private _uncapturederrorCall(event: Event) {
        console.warn("WebGPU uncaptured error: " + (event as GPUUncapturedErrorEvent).error);
        console.warn("WebGPU uncaptured error message: " + (event as GPUUncapturedErrorEvent).error.message);

    }

    /**
     * device lost handle
     * @param info 
     */
    private _deviceLostCall(info: GPUDeviceLostInfo) {
        console.error("WebGPU context lost. " + info);
    }

    /**
     * init webgpu environment
     * @returns 
     */
    async _initAsync(): Promise<void> {
        return await this._getAdapter().
            then((adapter: GPUAdapter | null) => {
                this._initAdapter(adapter);
                return this._getGPUdevice(this._config.deviceDescriptor);
            })
            .then((device: GPUDevice) => {
                this._initGPUDevice(device);
                return Promise.resolve();
            },
                (e) => {
                    console.log(e);
                    throw "couldnt get WebGPU Device";
                })
    }


    /**
     * get and config webgpu context
     */
    private _initContext() {
        this._context = this._canvas.getContext("webgpu") as GPUCanvasContext;
        if (!this._context) {
            throw "context cound not get "
        }
        let swapformat = this._config.swapChainFormat || navigator.gpu.getPreferredCanvasFormat();
        let usages = this._config.usage ?? GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        this._context.configure({
            device: this._device,
            format: swapformat,
            usage: usages,
            alphaMode: this._config.alphaMode
        });
        WGPURenderPipeline.offscreenFormat = swapformat;
    }

    async initRenderEngine() {
        await this._initAsync();
        this._initContext();

        this._samplerContext = new WebGPUSamplerContext(this);
        this._webGPUTextureContext = new WebGPUTextureContext(this);
        this._supportCapatable = new WebGPUCapable(this);
        //offscreen canvans
        this._cavansRT = new WebGPUInternalRT(this,RenderTargetFormat.R8G8B8A8,RenderTargetFormat.DEPTHSTENCIL_24_Plus,false,false,1);
        let _offscreenTex = new WebGPUInternalTex(this,0,0,TextureDimension.Tex2D,false);
        this._cavansRT.isOffscreenRT = true;
        _offscreenTex.resource = this._context.getCurrentTexture();
        this._cavansRT._textures.push(_offscreenTex);
        this._cavansRT._depthTexture = this._webGPUTextureContext.createRenderTextureInternal(TextureDimension.Tex2D,this._canvas.width,this._canvas.height,RenderTargetFormat.DEPTHSTENCIL_24_Plus,false,false);

        //limit TODO
        ///this._adapter 得到Webgpu限制

        WGPUBindGroupHelper.device = this._device;
        //TODO
    }
    applyRenderStateCMD(cmd: RenderStateCommand): void {
        //TODO
    }
    viewport(x: number, y: number, width: number, height: number): void {
        const lv = this._lastViewport;
        if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
            lv.setValue(x, y, width, height);
        }
    }
    scissor(x: number, y: number, width: number, height: number): void {
        const lv = this._lastScissor;
        if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
            lv.setValue(x, y, width, height);
        }
    }

    scissorTest(value: boolean): void {
        this._enableScissor = value;
    }

    clearRenderTexture(clearFlag: number, clearcolor: Color, clearDepth: number): void {
        let rt: WebGPUInternalRT = this._webGPUTextureContext.curBindWGPURT ?? this._cavansRT;
        rt.loadClear = true;
        rt.clearDes = {
            clearFlag: clearFlag,
            clearColor: clearcolor,
            clearDepth: clearDepth
        }
    }

    colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void {
        //TODO
    }
    copySubFrameBuffertoTex(texture: BaseTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
        //TODO
    }
    bindTexture(texture: BaseTexture): void {
        // No Use
    }


    propertyNameToID(name: string): number {
        if (this._propertyNameMap[name] != null) {
            return this._propertyNameMap[name];
        } else {
            var id: number = this._propertyNameCounter++;
            this._propertyNameMap[name] = id;
            this._propertyNameMap[id] = name;
            return id;
        }
    }
    propertyIDToName(id: number): string {
        return this._propertyNameMap[id];
    }
    getParams(params: RenderParams): number {
        //throw new Error("Method not implemented.");
        return 0;
    }
    getCapable(capatableType: RenderCapable): boolean {
        return this._supportCapatable.getCapable(capatableType);
    }
    getTextureContext(): WebGPUTextureContext {
        return this._webGPUTextureContext;
    }
    getDrawContext(): IRenderDrawContext {
        throw new Error("Method not implemented.");
    }
    get2DRenderContext(): IRender2DContext {
        throw new Error("Method not implemented.");
    }
    getCreateRenderOBJContext(): IRenderOBJCreate {
        //throw new Error("Method not implemented.");
        return null;
    }

    uploadUniforms(shader: IRenderShaderInstance, commandEncoder: CommandEncoder, shaderData: WGPUShaderData, uploadUnTexture: boolean): number {
        return 0;
        // let data= shaderData._data;
        // let bindGroup = shaderData._dataBindGroup;
        // let dataChangeFlag = shaderData._dataChangeFlag;
        // var shaderUniform: any[] = commandEncoder.getArrayData();
        // var shaderCall: number = 0;
        // for (var i: number = 0, n: number = shaderUniform.length; i < n; i++) {
        //     var one: WGPUShaderVariable = shaderUniform[i];
        //     if (uploadUnTexture || one.textureID !== -1) {//如uniform为纹理切换Shader时需要重新上传
        //         let dataid = one.dataOffset;
        //         var value: any = data[dataid];
        //         ;
        //         if (value != null)
        //             if(dataChangeFlag[dataid]){

        //             }
        //             shaderCall += one.fun.call(one.caller, one, value);
        //     }
        // }
        // return shaderCall;
    }

    uploadCustomUniforms(shader: IRenderShaderInstance, custom: any[], index: number, data: any): number {
        throw new Error("Method not implemented.");
    }
    createRenderStateComand(): RenderStateCommand {
        //throw new Error("Method not implemented.");
        return null;
    }
    createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType]; }): IRenderShaderInstance {
        throw new Error("Method not implemented.");
    }
    createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): WebGPUBuffer {
        let usage = GPUBUfferUsage.COPY_DST;
        switch (targetType) {
            case BufferTargetType.ARRAY_BUFFER://vertex
                usage = GPUBUfferUsage.VERTEX | GPUBUfferUsage.COPY_DST;
                break;
            case BufferTargetType.ELEMENT_ARRAY_BUFFER://index
                usage = GPUBUfferUsage.INDEX | GPUBUfferUsage.COPY_DST;
                break;
            case BufferTargetType.UNIFORM_BUFFER:
                usage = GPUBUfferUsage.UNIFORM | GPUBUfferUsage.COPY_DST;
                break;
            default:
                break;
        }
        return new WebGPUBuffer(this, usage, 0);
    }
    createVertexState(): IRenderVertexState {
        return null;
    }
    getUBOPointer(name: string): number {
        throw new Error("Method not implemented.");
    }
    clearStatisticsInfo(info: RenderStatisticsInfo): void {
        throw new Error("Method not implemented.");
    }
    getStatisticsInfo(info: RenderStatisticsInfo): number {
        throw new Error("Method not implemented.");
    }
    unbindVertexState(): void {
        throw new Error("Method not implemented.");
    }

    getCurCommandEncoder(): GPUCommandEncoder {
        return null
    }

    private _destroyDeferredBuffer(): void {
        for (let i = 0; i < this._deferredDestroyBuffers.length; ++i) {
            this._deferredDestroyBuffers[i].release();
        }
        this._deferredDestroyBuffers.length = 0;
    }

    private _destroyDefferedTexture(): void {
        for (let i = 0; i < this._deferredDestroyBuffers.length; ++i) {
            this._deferredDestroyTextures[i].disposDerredDispose();
        }
        this._deferredDestroyTextures.length = 0;
    }

    /**
     * resize canvans
     */
    resizeCavansRT(){
        if(this._cavansRT._depthTexture.width != this._canvas.width||this._cavansRT._depthTexture.height != this._canvas.height){
            this._cavansRT._depthTexture.resource.destroy();
            this._cavansRT._depthTexture = this._webGPUTextureContext.createRenderTextureInternal(TextureDimension.Tex2D,this._canvas.width,this._canvas.height,RenderTargetFormat.DEPTHSTENCIL_24_Plus,false,false);
        }
    }


    setRenderPassDescriptor(rt: WebGPUInternalRT, renderPassDec: WebGPURenderPassDescriptor) {
        
        this.resizeCavansRT();
        let gpurt;
        if(rt){
            gpurt = rt;
        }else{
            gpurt = this._cavansRT;
        }
        if (gpurt.loadClear) {
            let clearflag = gpurt.clearDes.clearFlag;
            //colorAttach
            renderPassDec.setColorAttachments(gpurt._textures as WebGPUInternalTex[], !!(clearflag & RenderClearFlag.Color), gpurt.clearDes.clearColor);
            renderPassDec.setDepthAttachments(gpurt._depthTexture as WebGPUInternalTex,!!(clearflag & RenderClearFlag.Depth), gpurt.clearDes.clearDepth);//default 1.0
            
        } else {
            renderPassDec.setColorAttachments(gpurt._textures as WebGPUInternalTex[], false);
            renderPassDec.setDepthAttachments(gpurt._depthTexture as WebGPUInternalTex, false);
        }
        this._cavansRT._textures[0].resource = this._context.getCurrentTexture();
        if(rt.isOffscreenRT) (renderPassDec.des.colorAttachments as Array<GPURenderPassColorAttachment>)[0].view = this._context.getCurrentTexture().createView();
    }


    createUniformBuffer(bufferSize: number): WebGPUBuffer {
        let usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
        return new WebGPUBuffer(this, usage, bufferSize);
    }

    /**
     * 
     * 每帧结束后的调用
     */
    endframe() {
        this._destroyDeferredBuffer();
        this._destroyDefferedTexture();
    }
}