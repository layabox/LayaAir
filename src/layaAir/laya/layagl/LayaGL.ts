import { IRender2DContext } from "../RenderEngine/RenderInterface/IRender2DContext";
import { IRenderDrawContext } from "../RenderEngine/RenderInterface/IRenderDrawContext";
import { IRenderEngine } from "../RenderEngine/RenderInterface/IRenderEngine";
import { IRenderOBJCreate } from "../RenderEngine/RenderInterface/IRenderOBJCreate";
import { ITextureContext } from "../RenderEngine/RenderInterface/ITextureContext";

/**
 * 封装GL命令
 */
export class LayaGL {
    static textureContext: ITextureContext;
    static renderEngine:IRenderEngine;
    static render2DContext:IRender2DContext;
    static renderDrawConatext:IRenderDrawContext;
    static renderOBJCreate:IRenderOBJCreate;
}