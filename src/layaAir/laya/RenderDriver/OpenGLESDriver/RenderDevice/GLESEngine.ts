import { Config } from "../../../../Config";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { NotImplementedError } from "../../../utils/Error";
import { Stat } from "../../../utils/Stat";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { RTShaderDefine } from "../../RenderModuleData/RuntimeModuleData/RTShaderDefine";
import { WebGLConfig } from "../../WebGLDriver/RenderDevice/WebGLEngine/WebGLConfig";
import { GLESTextureContext } from "./GLESTextureContext";

/**
 * WebGL mode.
 */
export enum GLESMode {
  /** Auto, use WebGL2.0 if support, or will fallback to WebGL1.0. */
  Auto = 0,
  /** WebGL2.0. */
  WebGL2 = 1,
  /** WebGL1.0, */
  WebGL1 = 2
}

/** JS-read/write mirror slot layout; shared contract with C++ GLESEngine. */
const enum EngineSlot {
  FramePassCount = 0, // i32, C++ writes / JS reads
  LoopCount = 1,      // i32, JS writes / C++ startFrame reads
  Count = 2,
  // enableUniformBufferObject / matUseUBO stay as native property_field (set immediately at init).
}
/**
 * @private 封装Webgl
 */
export class GLESEngine implements IRenderEngine {
  _context: any;
  _isShaderDebugMode: boolean;
  _nativeObj: any;
  private _GLTextureContext: GLESTextureContext;
  /** 4-slot mirror block shared with C++ GLESEngine. [0]i32 _framePassCount (C++ writes, JS reads),
   * [1]i32 loopCount (JS writes), [2]i32 enableUniformBufferObject, [3]i32 matUseUBO. */
  private _propsBuffer: ArrayBuffer;
  private _i32: Int32Array;
  constructor(config: WebGLConfig, webglMode: GLESMode = GLESMode.Auto) {
    this._nativeObj = new (window as any).conchGLESEngine(config, webglMode);
    this._propsBuffer = new ArrayBuffer(EngineSlot.Count * 4);
    this._i32 = new Int32Array(this._propsBuffer);
    this._nativeObj.bindPropertyBuffer(this._propsBuffer);
  }
  public get _framePassCount(): number {
    return this._i32[EngineSlot.FramePassCount];
  }
  public set _framePassCount(value: number) {
    this._i32[EngineSlot.FramePassCount] = value;
  }

  endFrame(): void {
    this._nativeObj.endFrame();
  }

  startFrame(): void {
    this._i32[EngineSlot.LoopCount] = Stat.loopCount;
    this._nativeObj.startFrame();
  }

  _remapZ: boolean = true;
  _screenInvertY: boolean = false;
  _lodTextureSample: boolean = true;
  _breakTextureSample: boolean = true;


  resizeOffScreen(width: number, height: number): void {
    this._nativeObj.resizeOffScreen(width, height);
  }

  getDefineByName(name: string): RTShaderDefine {
    let nativeRet: any = this._nativeObj.getDefineByName(name);
    let ret = new RTShaderDefine(nativeRet._index, nativeRet._value);
    return ret;
  }

  getNamesByDefineData(defineData: IDefineDatas, out: Array<string>): void {
    out.length = 0;
    this._nativeObj.getNamesByDefineData((defineData as any)._nativeObj, out);
  }
  addTexGammaDefine(key: number, value: RTShaderDefine): void {
    this._nativeObj.addTexGammaDefine(key, value);
  }
  initRenderEngine(canvas: HTMLCanvasElement): void {
    this._nativeObj.initRenderEngine((canvas as any)._nativeObj);
    this._GLTextureContext = new GLESTextureContext(this._nativeObj.getTextureContext());
    Config._uniformBlock = Config.enableUniformBufferObject && this.getCapable(RenderCapable.UnifromBufferObject);
    Config.matUseUBO = Config.matUseUBO && this.getCapable(RenderCapable.UnifromBufferObject);
    // Set immediately via property_field (not via the mirror block) so C++ has the right value
    // before the first startFrame — UBO setup reads these during init/first render.
    this._nativeObj.enableUniformBufferObject = Config._uniformBlock;
    this._nativeObj.matUseUBO = Config.matUseUBO;
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
    return this._nativeObj.rt_getParams(params);
  }
  getCapable(capatableType: RenderCapable): boolean {
    return this._nativeObj.rt_getCapable(capatableType);
  }
  getTextureContext(): ITextureContext {
    return this._GLTextureContext;
  }

  viewport(x: number, y: number, width: number, height: number): void {
    this._nativeObj.viewport(x, y, width, height);
  }
  scissor(x: number, y: number, width: number, height: number) {
    this._nativeObj.scissor(x, y, width, height);
  }
}


