import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { BaseTexture } from "../../../resource/BaseTexture";
import { BufferTargetType, BufferUsage } from "../../RenderEnum/BufferTargetType";
import { RenderCapable } from "../../RenderEnum/RenderCapable";
import { RenderClearFlag } from "../../RenderEnum/RenderClearFlag";
import { RenderParams } from "../../RenderEnum/RenderParams";
import { IRender2DContext } from "../../RenderInterface/IRender2DContext";
import { IRenderBuffer } from "../../RenderInterface/IRenderBuffer";
import { IRenderDrawContext } from "../../RenderInterface/IRenderDrawContext";
import { IRenderEngine } from "../../RenderInterface/IRenderEngine";
import { IRenderShaderInstance } from "../../RenderInterface/IRenderShaderInstance";
import { ITextureContext } from "../../RenderInterface/ITextureContext";
import { RenderStateCommand } from "../../RenderStateCommand";
import { NativeGL2TextureContext } from "./NativeGL2TextureContext";
import { WebGLMode } from "../WebGLEngine/GLEnum/WebGLMode";
import { NativeGLRender2DContext } from "./NativeGLRender2DContext";
import { NativeGLTextureContext } from "./NativeGLTextureContext";
import { WebGlConfig } from "../WebGLEngine/WebGLConfig";
import { NativeGLRenderDrawContext } from "./NativeGLRenderDrawContext";
import { RenderStatisticsInfo } from "../../RenderEnum/RenderStatInfo";
import { Color } from "../../../maths/Color";
import { NativeRenderStateCommand } from "./NativeRenderStateCommand";
import { IRenderEngineFactory } from "../../RenderInterface/IRenderEngineFactory";
import { InternalTexture } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { ShaderDataType } from "../../../RenderDriver/RenderModuleData/Design/ShaderData";


/**
 * @private 封装Webgl
 */
export class NativeWebGLEngine implements IRenderEngine {

  _context: WebGLRenderingContext | WebGL2RenderingContext;

  private _config: WebGlConfig;

  /**@internal ShaderDebugMode*/
  _isShaderDebugMode: boolean = true;

  private _GLTextureContext: NativeGLTextureContext;
  //Gl Draw
  private _GLRenderDrawContext: NativeGLRenderDrawContext;

  private _GL2DRenderContext: NativeGLRender2DContext;

  /**@internal */
  _renderOBJCreateContext: IRenderEngineFactory;

  _nativeObj: any;

  /**@internal */
  _IDCounter: number;

  constructor(config: WebGlConfig, webglMode: WebGLMode = WebGLMode.Auto) {
    this._nativeObj = new (window as any).conchWebGLEngine(webglMode);
  }

  createRenderStateComand(): RenderStateCommand {
    return new NativeRenderStateCommand();
  }
  getUBOPointer(name: string): number {
    return this._nativeObj.getUBOPointer(name);
  }

  _addStatisticsInfo(info: RenderStatisticsInfo, value: number) {
    this._nativeObj.addStatisticsInfo(info, value);
  }
  /**
 * 清除
 * @internal
 * @param info 
 */
  clearStatisticsInfo(info: RenderStatisticsInfo) {
    this._nativeObj.clearStatisticsInfo(info);
  }

  /**
   * @internal
   * @param info 
   * @returns 
   */
  getStatisticsInfo(info: RenderStatisticsInfo): number {
    return this._nativeObj.getStatisticsInfo(info);
  }
  /**
   * GL Context
   * @member {WebGLRenderingContext}
   */
  get gl() {
    return this._context;
  }

  get isWebGL2() {
    return this._nativeObj.isWebGL2;
  }

  get webglConfig() {
    return this._config;
  }

  /**
   * create GL
   * @param canvas 
   */
  initRenderEngine(canvas: any) {
    this._nativeObj.initRenderEngine();
    this._GLRenderDrawContext = new NativeGLRenderDrawContext(this);

    if (this.isWebGL2) {
      this._GLTextureContext = new NativeGL2TextureContext(this, new (window as any).conchGL2TextureContext(this._nativeObj));
    }
    else {
      this._GLTextureContext = new NativeGLTextureContext(this, new (window as any).conchGLTextureContext(this._nativeObj));
    }
  }

  bindTexture(texture: BaseTexture) {
    throw new Error("Method not implemented.");
  }

  applyRenderStateCMD(cmd: RenderStateCommand): void {
    this._nativeObj.applyRenderStateCommand((cmd as any)._nativeObj);
  }

  //get capable of webgl
  getCapable(capatableType: RenderCapable): boolean {
    return this._nativeObj.getCapable(capatableType);
  }

  viewport(x: number, y: number, width: number, height: number): void {
    this._nativeObj.viewport(x, y, width, height);
  }

  scissor(x: number, y: number, width: number, height: number) {
    this._nativeObj.scissor(x, y, width, height);
  }

  scissorTest(value: boolean) {
    this._nativeObj.scissorTest(value);
  }

  clearRenderTexture(clearFlag: RenderClearFlag, clearcolor: Color = null, clearDepth: number = 1) {
    if (clearcolor)
      this._nativeObj.clearRenderTexture(clearFlag, true, clearcolor.r, clearcolor.g, clearcolor.b, clearcolor.a, clearDepth);
    else
      this._nativeObj.clearRenderTexture(clearFlag, false, Color.BLACK.r, Color.BLACK.g, Color.BLACK.b, Color.BLACK.a, clearDepth);
  }

  copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number) {
    this._nativeObj.copySubFrameBuffertoTex(texture, level, xoffset, yoffset, x, y, width, height);
  }

  colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void {
    this._nativeObj.colorMask(r, g, b, a);
  }

  getParams(params: RenderParams): number {
    return this._nativeObj.getParams(params);
  }


  createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): IRenderBuffer {
    //TODO SourceManager
    return new (window as any).conchGLBuffer(this._nativeObj, targetType, bufferUsageType);
  }

  createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }): IRenderShaderInstance {
    throw new Error("Method not implemented.");
  }



  getTextureContext(): ITextureContext {
    return this._GLTextureContext;
  }

  //TODO 先写完测试，这种封装过于死板
  getDrawContext(): IRenderDrawContext {
    return this._GLRenderDrawContext;
  }

  get2DRenderContext(): IRender2DContext {
    return this._GL2DRenderContext;
  }

  getCreateRenderOBJContext(): IRenderEngineFactory {
    return this._renderOBJCreateContext;
  }

  propertyNameToID(name: string): number {
    return this._nativeObj.propertyNameToID(name);
  }

  propertyIDToName(id: number): string {
    throw new Error("Method not implemented.");
  }

  uploadUniforms(shader: IRenderShaderInstance, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number {
    throw new Error("Method not implemented.");
  }
  uploadCustomUniforms(shader: IRenderShaderInstance, custom: any[], index: number, data: any): number {
    throw new Error("Method not implemented.");
  }
  unbindVertexState(): void {
    this._nativeObj.unbindVertexState && this._nativeObj.unbindVertexState();
  }
}


