import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { RTShaderDefine } from "../../RenderModuleData/RuntimeModuleData/RTShaderDefine";
import { WebGLMode } from "../../WebGLDriver/RenderDevice/WebGLEngine/GLEnum/WebGLMode";
import { WebGLConfig } from "../../WebGLDriver/RenderDevice/WebGLEngine/WebGLConfig";
import { GLESTextureContext } from "./GLESTextureContext";


/**
 * @private 封装Webgl
 */
export class GLESEngine implements IRenderEngine {
  _context: any;
  _isShaderDebugMode: boolean;
  _renderOBJCreateContext: IRenderEngineFactory;
  _nativeObj: any;
  private _GLTextureContext: GLESTextureContext;
  constructor(config: WebGLConfig, webglMode: WebGLMode = WebGLMode.Auto) {
    this._nativeObj = new (window as any).conchGLESEngine(config, webglMode);
  }
  _enableStatistics: boolean;
  resizeOffScreen(width: number, height: number): void { }

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
  initRenderEngine(canvas: any): void {
    this._nativeObj.initRenderEngine();
    this._GLTextureContext = new GLESTextureContext(this._nativeObj.getTextureContext());
  }
  copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
    throw new Error("Method not implemented.");
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
    return this._GLTextureContext;
  }
  getCreateRenderOBJContext(): IRenderEngineFactory {
    throw new Error("Method not implemented.");
  }
  clearStatisticsInfo(): void {
    //this._nativeObj.clearStatisticsInfo();
  }
  getStatisticsInfo(info: GPUEngineStatisticsInfo): number {
    return this._nativeObj.getStatisticsInfo(info);
  }
  viewport(x: number, y: number, width: number, height: number): void {
    this._nativeObj.viewport(x, y, width, height);
  }
  scissor(x: number, y: number, width: number, height: number) {
    this._nativeObj.scissor(x, y, width, height);
  }
}


