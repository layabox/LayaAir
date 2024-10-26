import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebGPUCapable } from "./WebGPUCapable";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPUBufferManager } from "./WebGPUUniform/WebGPUBufferManager";
import { WebGPURenderEngineFactory } from "./WebGPURenderEngineFactory";
import { WebGPUTextureContext, WebGPUTextureFormat } from "./WebGPUTextureContext";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { NotImplementedError } from "../../../utils/Error";

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
    swapChainFormat?: WebGPUTextureFormat;
    /**
     * canvans alpha mode
     */
    alphaMode: GPUCanvasAlphaMode = 'premultiplied';
    /**
     * attach canvans usage
     */
    usage?: GPUTextureUsageFlags = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
    /**
     * color space
     */
    colorSpace? = 'srgb' /* default="srgb" */;
    /**
     * depth and stencil
     */
    depthStencilFormat = WebGPUTextureFormat.depth24plus_stencil8;
    /**
     * multi sample（msaa = 4x）
     */
    msaa = false;
}

/**
 * WebGPU渲染引擎
 */
export class WebGPURenderEngine implements IRenderEngine {
    static _offscreenFormat: GPUTextureFormat;
    static _instance: WebGPURenderEngine;
    _isShaderDebugMode: boolean;
    _renderOBJCreateContext: IRenderEngineFactory;

    _canvas: HTMLCanvasElement;
    _context: GPUCanvasContext;
    _config: WebGPUConfig;

    screenResized: boolean = false;
    _screenRT: WebGPUInternalRT; //屏幕渲染目标（绑定Canvas）

    _remapZ: boolean = false;
    _screenInvertY: boolean = true;
    _lodTextureSample: boolean = false;
    _breakTextureSample: boolean = false;

    _enableStatistics: boolean;

    private _adapter: GPUAdapter;
    private _device: GPUDevice;
    private _supportCapatable: WebGPUCapable;
    private _textureContext: WebGPUTextureContext;

    private _adapterSupportedExtensions: GPUFeatureName[];
    private _deviceEnabledExtensions: GPUFeatureName[];

    private _GPUStatisticsInfo: Map<GPUEngineStatisticsInfo, number> = new Map();

    gpuBufferMgr: WebGPUBufferManager; //GPU大内存管理器

    globalId: number;
    objectName: string = 'WebGPURenderEngine';

    /**
     * 实例化一个webgpuEngine
     */
    constructor(config: WebGPUConfig, canvas: any) {
        this._config = config;
        this._canvas = canvas;
        if (navigator.gpu)
            WebGPURenderEngine._instance = this;
        else console.error('WebGPU is not supported by your browser');

        this.gpuBufferMgr = new WebGPUBufferManager(WebGPUGlobal.useBigBuffer);

        this._initStatisticsInfo();
        this.globalId = WebGPUGlobal.getId(this);
    }

    /**
     * 获取适配器
     */
    private _getAdapter(): Promise<GPUAdapter> {
        return navigator.gpu!.requestAdapter({ powerPreference: this._config.powerPreference });
    }

    /**
     * 初始化适配器
     * @param adapter 
     */
    private _initAdapter(adapter: GPUAdapter) {
        if (!adapter) {
            throw 'Could not retrieve a WebGPU adapter (adapter is null).';
        } else {
            this._adapter = adapter;
            const deviceDescriptor = this._config.deviceDescriptor;
            this._adapterSupportedExtensions = [];
            this._adapter.features?.forEach(feature => this._adapterSupportedExtensions.push(feature as GPUFeatureName));
            if (deviceDescriptor?.requiredFeatures) {
                const requestedExtensions = deviceDescriptor.requiredFeatures;
                const validExtensions: GPUFeatureName[] = [];
                for (const extension of requestedExtensions)
                    if (this._adapterSupportedExtensions.indexOf(extension) !== -1)
                        validExtensions.push(extension);
                deviceDescriptor.requiredFeatures = validExtensions;
            }
        }
    }

    /**
     * 获取WebGPU设备
     * @param deviceDescriptor 
     */
    private _getGPUdevice(deviceDescriptor: GPUDeviceDescriptor): Promise<GPUDevice> {
        this._supportCapatable = new WebGPUCapable(deviceDescriptor);
        return this._adapter.requestDevice(deviceDescriptor);
    }

    /**
     * 显示错误信息
     * @param event 
     */
    private _unCapturedErrorCall(event: Event) {
        console.warn('WebGPU unCaptured error: ' + (event as GPUUncapturedErrorEvent).error);
        console.warn('WebGPU unCaptured error message: ' + (event as GPUUncapturedErrorEvent).error.message);
    }

    /**
     * 设备丢失
     * @param info 
     */
    private _deviceLostCall(info: GPUDeviceLostInfo) {
        console.error('WebGPU context lost' + info);
    }

    /**
     * 初始化WebGPU设备
     * @param device 
     */
    private _initDevice(device: GPUDevice) {
        this._device = device;
        this._deviceEnabledExtensions = [];
        this._device.features.forEach(element => {
            this._deviceEnabledExtensions.push(element as GPUFeatureName);
        });
        this._device.addEventListener('uncapturederror', this._unCapturedErrorCall);
        this._device.lost.then(this._deviceLostCall);
    }

    /**
     * 初始化WebGPU
     */
    async _initAsync(): Promise<void> {
        return await this._getAdapter()
            .then((adapter: GPUAdapter | null) => {
                this._initAdapter(adapter);
                return this._getGPUdevice(this._config.deviceDescriptor);
            })
            .then((device: GPUDevice) => {
                this._initDevice(device);
                return Promise.resolve();
            },
                (e) => {
                    console.log(e);
                    throw 'Could not get WebGPU device';
                })
    }

    /**
     * 画布尺寸改变
     * @param width 
     * @param height 
     */
    resizeOffScreen(width: number, height: number): void {
        const w = width | 0;
        const h = height | 0;
        if (w === 0 || h === 0) return;
        if (!this._screenRT
            || this._screenRT._textures[0].width !== w
            || this._screenRT._textures[0].height !== h) {
            console.log('canvas resize =', w, h);
            this.createScreenRT();
        }
    }

    getDevice(): GPUDevice {
        return this._device;
    }

    /**
     * 开始新的一帧
     */
    startFrame() {
        this.gpuBufferMgr.startFrame();
    }

    /**
     * 上传数据
     */
    upload() {
        this.gpuBufferMgr.upload();
    }

    /**
     * 设置WebGPU画图上下文
     */
    private _initContext() {
        this._context = this._canvas.getContext('webgpu') as GPUCanvasContext;
        if (!this._context)
            throw 'Could not get context';
        const preferredFormat = navigator.gpu.getPreferredCanvasFormat();
        console.log('preferredFormat =', preferredFormat);
        const format = this._config.swapChainFormat || WebGPUTextureFormat.bgra8unorm;
        const usage = this._config.usage ?? GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
        this._context.configure({
            device: this._device,
            format,
            usage,
            alphaMode: this._config.alphaMode,
        });
        WebGPURenderEngine._offscreenFormat = format;
    }

    /**
     * 初始化渲染引擎
     */
    async initRenderEngine() {
        await this._initAsync();
        this._initContext();

        this._textureContext = new WebGPUTextureContext(this);
        this.createScreenRT();
    }

    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
        throw new NotImplementedError;
    }

    /**@internal */
    private _propertyNameMap: any = {};
    /**@internal */
    private _propertyNameCounter: number = 0;
    propertyNameToID(name: string): number {
        if (this._propertyNameMap[name] !== undefined) {
            return this._propertyNameMap[name];
        } else {
            const id = this._propertyNameCounter++;
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
    private _maskMap: { [key: number]: string }[] = [];
    getDefineByName(name: string): ShaderDefine {
        let define: ShaderDefine = this._defineMap[name];
        if (!define) {
            const maskMap = this._maskMap;
            const counter = this._defineCounter;
            const index = Math.floor(counter / 32);
            const value = 1 << counter % 32;
            define = new ShaderDefine(index, value);
            this._defineMap[name] = define;
            if (index === maskMap.length) {
                maskMap.length++;
                maskMap[index] = {};
            }
            maskMap[index][value] = name;
            this._defineCounter++;
        }
        return define;
    }
    getNamesByDefineData(defineData: IDefineDatas, out: string[]): void {
        const maskMap: Array<{ [key: number]: string }> = this._maskMap;
        const mask: Array<number> = defineData._mask;
        out.length = 0;
        for (let i = 0, n = defineData._length; i < n; i++) {
            const subMaskMap: { [key: number]: string } = maskMap[i];
            const subMask: number = mask[i];
            for (let j = 0; j < 32; j++) {
                const d = 1 << j;
                if (subMask > 0 && d > subMask) //如果31位存在subMask为负数, 避免break
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
        switch (params) {
            case RenderParams.Max_Active_Texture_Count:
                return this._device.limits.maxSampledTexturesPerShaderStage;
            case RenderParams.Max_Uniform_Count:
                return this._device.limits.maxUniformBuffersPerShaderStage;
            case RenderParams.Max_AnisoLevel_Count:
                return 16; //?
            case RenderParams.MAX_Texture_Size:
                return this._device.limits.maxTextureDimension2D;
            case RenderParams.MAX_Texture_Image_Uint:
                return 1024; //?
        }
        return 0;
    }

    /**获得是否支持某种能力 */
    getCapable(capatableType: RenderCapable): boolean {
        return this._supportCapatable.getCapable(capatableType);
    }

    getTextureContext(): ITextureContext {
        return this._textureContext;
    }

    getCreateRenderOBJContext(): WebGPURenderEngineFactory {
        return new WebGPURenderEngineFactory()
    }

    private _initStatisticsInfo() {
        for (let i = 0; i < GPUEngineStatisticsInfo.Count; i++) {
            this._GPUStatisticsInfo.set(i, 0);
        }
    }

    /**
     * @internal
     * @param info 
     * @param value 
     */
    _addStatisticsInfo(info: GPUEngineStatisticsInfo, value: number) {
        this._enableStatistics && this._GPUStatisticsInfo.set(info, this._GPUStatisticsInfo.get(info) + value);
    }

    /**
     * 清除
     * @internal
     * @param info 
     */
    clearStatisticsInfo() {
        if (this._enableStatistics) {
            for (let i = 0; i < GPUEngineStatisticsInfo.FrameClearCount; i++) {
                this._GPUStatisticsInfo.set(i, 0);
            }
        }
    }

    /**
     * @internal
     * @param info 
     */
    getStatisticsInfo(info: GPUEngineStatisticsInfo): number {
        return this._GPUStatisticsInfo.get(info);
    }

    /**
     * 创建屏幕渲染目标
     */
    createScreenRT() {
        this._screenRT =
            this._textureContext.createRenderTargetInternal
                (this._canvas.width, this._canvas.height, RenderTargetFormat.R8G8B8A8,
                    RenderTargetFormat.None, false, false, 1) as WebGPUInternalRT;
        this.screenResized = true;
    }

    endFrame() {
    }
}