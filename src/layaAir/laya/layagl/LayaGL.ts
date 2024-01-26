import { IRenderDeviceFactory } from "../RenderDriver/DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IUnitRenderModuleDataFactory } from "../RenderDriver/RenderModuleData/Design/IUnitRenderModuleDataFactory";
import { IRender2DContext } from "../RenderEngine/RenderInterface/IRender2DContext";
import { IRenderDrawContext } from "../RenderEngine/RenderInterface/IRenderDrawContext";
import { IRenderEngine } from "../RenderEngine/RenderInterface/IRenderEngine";
import { IRenderEngineFactory } from "../RenderEngine/RenderInterface/IRenderEngineFactory";
import { ITextureContext } from "../RenderEngine/RenderInterface/ITextureContext";

/**
 * 封装GL命令
 */
export class LayaGL {
    static textureContext: ITextureContext;
    static renderEngine: IRenderEngine;
    static render2DContext: IRender2DContext;
    static renderDrawContext: IRenderDrawContext;
    static renderOBJCreate: IRenderEngineFactory;

    static renderDeviceFactory:IRenderDeviceFactory;
    static unitRenderModuleDataFactory:IUnitRenderModuleDataFactory;
}