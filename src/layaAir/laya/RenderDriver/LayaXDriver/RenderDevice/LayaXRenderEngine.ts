import { Config } from "../../../../Config";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { RTShaderDefine } from "../../RenderModuleData/RuntimeModuleData/RTShaderDefine";
import { WebGPUShaderCompiler } from "../../WebGPUDriver/RenderDevice/ShaderCompiler/WebGPUShaderCompiler";
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
        // No-op: C++ main loop drives frame start
    }

    endFrame(): void {
        // No-op: C++ main loop drives frame end
    }

    viewport(x: number, y: number, width: number, height: number): void {
        this._nativeObj.viewport(x, y, width, height);
    }

    scissor(x: number, y: number, width: number, height: number) {
        this._nativeObj.scissor(x, y, width, height);
    }
}
