import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { WebGLMode } from "../../WebGLDriver/RenderDevice/WebGLEngine/GLEnum/WebGLMode";
import { WebGLConfig } from "../../WebGLDriver/RenderDevice/WebGLEngine/WebGLConfig";


/**
 * @private 封装Webgl
 */
export class GLESEngine implements IRenderEngine {
  _context: any;
  _isShaderDebugMode: boolean;
  _renderOBJCreateContext: IRenderEngineFactory;
  _nativeObj: any;
  constructor(config: WebGLConfig, webglMode: WebGLMode = WebGLMode.Auto) {
    this._nativeObj = new (window as any).conchGLESEngine(config, webglMode);
  }
  initRenderEngine(canvas: any): void {
    this._nativeObj.initRenderEngine();
  }
  copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
    throw new Error("Method not implemented.");
  }
  propertyNameToID(name: string): number {
    throw new Error("Method not implemented.");
  }
  propertyIDToName(id: number): string {
    throw new Error("Method not implemented.");
  }
  getParams(params: RenderParams): number {
    throw new Error("Method not implemented.");
  }
  getCapable(capatableType: RenderCapable): boolean {
    throw new Error("Method not implemented.");
  }
  getTextureContext(): ITextureContext {
    throw new Error("Method not implemented.");
  }
  getCreateRenderOBJContext(): IRenderEngineFactory {
    throw new Error("Method not implemented.");
  }
  clearStatisticsInfo(info: RenderStatisticsInfo): void {
    throw new Error("Method not implemented.");
  }
  getStatisticsInfo(info: RenderStatisticsInfo): number {
    throw new Error("Method not implemented.");
  }

}


