import { Config } from "../../../../Config";
import { LayaGL } from "../../../layagl/LayaGL";
import { StatElement } from "../../../layagl/StatisticsContext";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { RTShaderDefine } from "../../RenderModuleData/RuntimeModuleData/RTShaderDefine";
import { WebGPUShaderCompiler } from "../../WebGPUDriver/RenderDevice/ShaderCompiler/WebGPUShaderCompiler";
import { LayaXReadbackDispatcher } from "./LayaXReadbackDispatcher";
import { LayaXTextureContext } from "./LayaXTextureContext";

/**
 * LayaX render engine implementation.
 * Uses wgpu-based native backend via conchLayaXDevice.
 */
export class LayaXRenderEngine implements IRenderEngine {
    static _instance: LayaXRenderEngine;

    _context: any;
    _isShaderDebugMode: boolean;
    _nativeObj: any;
    private _textureContext: LayaXTextureContext;
    private _lastTextureMemory: number = 0;
    private _lastRenderTargetMemory: number = 0;
    private _lastDeviceBufferMemory: number = 0;
    private _lastGpuBufferMemory: number = 0;
    private _lastGpuMemory: number = 0;

    shaderCompiler: WebGPUShaderCompiler;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXDevice();
        this.shaderCompiler = new WebGPUShaderCompiler();
        LayaXRenderEngine._instance = this;
    }

    public get _framePassCount(): number {
        return this._nativeObj._framePassCount;
    }
    public set _framePassCount(value: number) {
        this._nativeObj._framePassCount = value;
    }

    // wgpu-like settings (same as WebGPU)
    _remapZ: boolean = false;
    _screenInvertY: boolean = true;
    _lodTextureSample: boolean = false;
    _breakTextureSample: boolean = false;

    initRenderEngine(canvas: HTMLCanvasElement): void {
        this._nativeObj.initRenderEngine((canvas as any)._nativeObj);
        this._textureContext = new LayaXTextureContext(this._nativeObj.getTextureContext());
        Config._uniformBlock = Config.enableUniformBufferObject && this.getCapable(RenderCapable.UnifromBufferObject);
        Config.matUseUBO = Config.matUseUBO && this.getCapable(RenderCapable.UnifromBufferObject);
        this._nativeObj.enableUniformBufferObject = Config._uniformBlock;
        this._nativeObj.matUseUBO = Config.matUseUBO;
    }

    resizeOffScreen(width: number, height: number): void {
        this._nativeObj.resizeOffScreen(width, height);
    }

    getDefineByName(name: string): RTShaderDefine {
        // C++ returns packed u64: (index << 32) | value
        let packed: number = this._nativeObj.getDefineByName(name);
        let index = Math.floor(packed / 4294967296); // packed >>> 32 (JS safe for 53-bit)
        let value = packed - index * 4294967296;      // packed & 0xFFFFFFFF
        return new RTShaderDefine(index, value);
    }

    getNamesByDefineData(defineData: IDefineDatas, out: Array<string>): void {
        out.length = 0;
        // C++ returns newline-separated string of define names
        let names: string = this._nativeObj.getNamesByDefineData((defineData as any)._nativeObj);
        if (names && names.length > 0) {
            let arr = names.split('\n');
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].length > 0) out.push(arr[i]);
            }
        }
    }

    addTexGammaDefine(key: number, value: RTShaderDefine): void {
        this._nativeObj.addTexGammaDefine(key, value);
    }

    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
        this._nativeObj.copySubFrameBuffertoTex((texture as any)._nativeObj, level, xoffset, yoffset, x, y, width, height);
    }

    propertyNameToID(name: string): number {
        return this._nativeObj.propertyNameToID(name);
    }

    propertyIDToName(id: number): string {
        return this._nativeObj.propertyIDToName(id);
    }

    getParams(params: RenderParams): number {
        return this._nativeObj.getParams(params);
    }

    getCapable(capatableType: RenderCapable): boolean {
        return this._nativeObj.getCapable(capatableType);
    }

    getTextureContext(): ITextureContext {
        return this._textureContext;
    }

    startFrame(): void {
        this._syncStatistics();
        // 拉取底层 DeviceEvent，派发 ReadbackCompleted/Failed / DeviceLost
        LayaXReadbackDispatcher.pump(this._nativeObj);
    }

    endFrame(): void {
        // C++ main loop drives layax_post_render after JS rendering.
    }

    private _recordAbsoluteMemory(element: StatElement, bytes: number, lastBytes: number): number {
        let delta = bytes - lastBytes;
        if (delta !== 0) {
            LayaGL.statAgent.recordMemoryData(element, delta);
            return bytes;
        }
        return lastBytes;
    }

    private _syncStatistics(): void {
        let nativeObj = this._nativeObj;
        if (!nativeObj || !nativeObj.frameOpaqueDrawCall)
            return;

        let opaque = nativeObj.frameOpaqueDrawCall();
        let transparent = nativeObj.frameTransparentDrawCall();
        let depth = nativeObj.frameDepthDrawCall();
        let shadow = nativeObj.frameShadowDrawCall();
        let triangle = nativeObj.frameTriangle();
        let cullMainTime = nativeObj.frameCullMainTime();
        let draw2D = nativeObj.consumeFrame2DDrawCall ? nativeObj.consumeFrame2DDrawCall() : 0;
        let draw3D = opaque + transparent;

        LayaGL.statAgent.recordCTData(StatElement.CT_OpaqueDrawCall, opaque);
        LayaGL.statAgent.recordCTData(StatElement.CT_TransDrawCall, transparent);
        LayaGL.statAgent.recordCTData(StatElement.CT_DepthCastDrawCall, depth);
        LayaGL.statAgent.recordCTData(StatElement.CT_ShadowDrawCall, shadow);
        LayaGL.statAgent.recordCTData(StatElement.CT_2DDrawCall, draw2D);
        LayaGL.statAgent.recordCTData(StatElement.CT_3DDrawCall, draw3D);
        LayaGL.statAgent.recordCTData(StatElement.CT_DrawCall, draw2D + draw3D + depth + shadow);
        LayaGL.statAgent.recordCTData(StatElement.CT_Triangle, triangle);
        LayaGL.statAgent.recordTimeData(StatElement.T_CullMain, cullMainTime);

        let textureMemory = nativeObj.gpuTextureTotalMemorySize();
        let renderTargetMemory = nativeObj.gpuRenderTargetTotalMemorySize();
        let deviceBufferMemory = nativeObj.gpuDeviceBufferTotalMemorySize();
        let gpuBufferMemory = nativeObj.gpuBufferTotalMemorySize ? nativeObj.gpuBufferTotalMemorySize() : deviceBufferMemory;
        let gpuMemory = textureMemory + renderTargetMemory + gpuBufferMemory;

        this._lastTextureMemory = this._recordAbsoluteMemory(StatElement.M_AllTexture, textureMemory, this._lastTextureMemory);
        this._lastRenderTargetMemory = this._recordAbsoluteMemory(StatElement.M_RenderTexture, renderTargetMemory, this._lastRenderTargetMemory);
        this._lastDeviceBufferMemory = this._recordAbsoluteMemory(StatElement.M_DeviceBuffer, deviceBufferMemory, this._lastDeviceBufferMemory);
        this._lastGpuBufferMemory = this._recordAbsoluteMemory(StatElement.M_GPUBuffer, gpuBufferMemory, this._lastGpuBufferMemory);
        this._lastGpuMemory = this._recordAbsoluteMemory(StatElement.M_GPUMemory, gpuMemory, this._lastGpuMemory);
    }

    viewport(x: number, y: number, width: number, height: number): void {
        this._nativeObj.viewport(x, y, width, height);
    }

    scissor(x: number, y: number, width: number, height: number) {
        this._nativeObj.scissor(x, y, width, height);
    }
}
