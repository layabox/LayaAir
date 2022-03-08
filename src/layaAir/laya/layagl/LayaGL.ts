import { IRender2DContext } from "../RenderEngine/RenderInterface/IRender2DContext";
import { IRenderEngine } from "../RenderEngine/RenderInterface/IRenderEngine";
import { ITextureContext } from "../RenderEngine/RenderInterface/ITextureContext";

/**
 * @internal
 * 封装GL命令
 */
export class LayaGL {
    static instance: WebGLRenderingContext;

    static textureContext: ITextureContext;
    static renderEngine:IRenderEngine;
    static render2DContext:IRender2DContext;
}



