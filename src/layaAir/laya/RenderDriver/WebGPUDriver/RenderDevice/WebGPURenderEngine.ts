import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebGPURenderEngineFactory } from "./WebGPURenderEngineFactory";
import { WebGPUTextureContext } from "./WebGPUTextureContext";
export class WebGPUConfig {
    /**
  * Defines the category of adapter to use.
  */
    powerPreference: GPUPowerPreference;
    /**
     * Defines the device descriptor used to create a device.
     */
    deviceDescriptor?: GPUDeviceDescriptor = {};
    /**
     * context params 
     */
    swapChainFormat?: GPUTextureFormat;
    /**
     * canvans alpha mode
     */
    alphaMode: GPUCanvasAlphaMode = "premultiplied";
    /**
     * attach canvans usage
     */
    usage?: GPUTextureUsageFlags = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
    /**
     * color space
     */
    colorSpace? = "srgb" /* default="srgb" */;

}

export class WebGPURenderEngine implements IRenderEngine {
    static _offscreenFormat: GPUTextureFormat;
    static _instance:WebGPURenderEngine;
    _isShaderDebugMode: boolean;
    _renderOBJCreateContext: IRenderEngineFactory;

    /**canvas */
    _canvas: HTMLCanvasElement;
    /**context */
    _context: GPUCanvasContext;
    /**config */
    _config: WebGPUConfig;

    /**@internal */
    private _adapter: GPUAdapter;

    private _adapterSupportedExtensions: GPUFeatureName[];

    private _device: GPUDevice;

    private _deviceEnabledExtensions: GPUFeatureName[];

    private _textureContext:WebGPUTextureContext;

    
    /**
     * 实例化一个webgpuEngine
     */
    constructor(config: WebGPUConfig, canvas: any) {
        this._canvas = canvas;
        this._config = config;

        if (!navigator.gpu) {
            console.error("WebGPU is not supported by your browser.");
            return;
        }
        WebGPURenderEngine._instance = this;

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
    private _initAdapter(adapter: GPUAdapter) {
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

    getDevice():GPUDevice{
        return this._device;
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
        WebGPURenderEngine._offscreenFormat = swapformat;
    }


    async initRenderEngine() {
        await this._initAsync();
        this._initContext();

        this._textureContext = new WebGPUTextureContext(this);
        // // this._samplerContext = new WebGPUSamplerContext(this);
        // // this._webGPUTextureContext = new WebGPUTextureContext(this);
        // // this._supportCapatable = new WebGPUCapable(this);
        // // //offscreen canvans
        // this._cavansRT = new WebGPUInternalRT(this, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTHSTENCIL_24_Plus, false, false, 1);
        // let _offscreenTex = new WebGPUInternalTex(this, 0, 0, TextureDimension.Tex2D, false);
        // this._cavansRT.isOffscreenRT = true;
        // _offscreenTex.resource = this._context.getCurrentTexture();
        // this._cavansRT._textures.push(_offscreenTex);
        // this._cavansRT._depthTexture = this._webGPUTextureContext.createRenderTextureInternal(TextureDimension.Tex2D, this._canvas.width, this._canvas.height, RenderTargetFormat.DEPTHSTENCIL_24_Plus, false, false);

        // //limit TODO
        // ///this._adapter 得到Webgpu限制

        // WGPUBindGroupHelper.device = this._device;
        // //TODO
    }
    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
        throw new Error("Method not implemented.");
    }

    /**@internal */
    private _propertyNameMap: any = {};
    /**@internal */
    private _propertyNameCounter: number = 0;



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

    /**@internal */
    private _defineMap: { [key: string]: ShaderDefine } = {};
    /**@internal */
    private _defineCounter: number = 0;
    /**@internal */
    private _maskMap: Array<{ [key: number]: string }> = [];

    getDefineByName(name: string): ShaderDefine {
        var define: ShaderDefine = this._defineMap[name];
        if (!define) {
            var maskMap = this._maskMap;
            var counter: number = this._defineCounter;
            var index: number = Math.floor(counter / 32);
            var value: number = 1 << counter % 32;
            define = new ShaderDefine(index, value);
            this._defineMap[name] = define;
            if (index == maskMap.length) {
                maskMap.length++;
                maskMap[index] = {};
            }
            maskMap[index][value] = name;
            this._defineCounter++;
        }
        return define;
    }

    getNamesByDefineData(defineData: IDefineDatas, out: string[]): void {
        var maskMap: Array<{ [key: number]: string }> = this._maskMap;
        var mask: Array<number> = defineData._mask;
        out.length = 0;
        for (var i: number = 0, n: number = defineData._length; i < n; i++) {
            var subMaskMap: { [key: number]: string } = maskMap[i];
            var subMask: number = mask[i];
            for (var j: number = 0; j < 32; j++) {
                var d: number = 1 << j;
                if (subMask > 0 && d > subMask)//如果31位存在subMask为负数,避免break
                    break;
                if (subMask & d)
                    out.push(subMaskMap[d]);
            }
        }
    }
    
    _texGammaDefine: { [key: number]: ShaderDefine } = {};
    addTexGammaDefine(key: number, value: ShaderDefine): void {
       this._texGammaDefine[key] = value;
    }
    
    /**获得各个参数 */
    getParams(params: RenderParams): number {
        throw new Error("Method not implemented.");
    }
    /**获得是否支持某种能力 */
    getCapable(capatableType: RenderCapable): boolean {
        throw new Error("Method not implemented.");
    }
    getTextureContext(): ITextureContext {
        return this._textureContext;
    }
    getCreateRenderOBJContext(): WebGPURenderEngineFactory {
      return new WebGPURenderEngineFactory()
    }

    //统计相关
    clearStatisticsInfo(info: RenderStatisticsInfo): void {
        //throw new Error("Method not implemented.");
    }

    //统计相关
    getStatisticsInfo(info: RenderStatisticsInfo): number {
        return 0;
        throw new Error("Method not implemented.");
    }

}