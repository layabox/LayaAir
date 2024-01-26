import { IRenderDeviceFactory } from "../RenderDriver/DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderEngine } from "../RenderDriver/DriverDesign/RenderDevice/IRenderEngine";
import { IRenderEngineFactory } from "../RenderDriver/DriverDesign/RenderDevice/IRenderEngineFactory";
import { ITextureContext } from "../RenderDriver/DriverDesign/RenderDevice/ITextureContext";
import { IUnitRenderModuleDataFactory } from "../RenderDriver/RenderModuleData/Design/IUnitRenderModuleDataFactory";

/**
 * 封装GL命令
 */
export class LayaGL {
    static textureContext: ITextureContext;
    static renderEngine: IRenderEngine;
    static renderOBJCreate: IRenderEngineFactory;

    static renderDeviceFactory:IRenderDeviceFactory;
    static unitRenderModuleDataFactory:IUnitRenderModuleDataFactory;
}