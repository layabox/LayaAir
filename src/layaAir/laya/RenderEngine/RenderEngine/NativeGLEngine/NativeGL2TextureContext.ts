import { NativeGLTextureContext } from "./NativeGLTextureContext";
import { NativeWebGLEngine } from "./NativeWebGLEngine";
import { TextureDimension } from "../../RenderEnum/TextureDimension";
import { HDRTextureInfo } from "../../HDRTextureInfo";
import { FilterMode } from "../../RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../RenderEnum/TextureCompareMode";
import { TextureFormat } from "../../RenderEnum/TextureFormat";
import { KTXTextureInfo } from "../../KTXTextureInfo";
import { InternalTexture } from "../../RenderInterface/InternalTexture";
import { InternalRenderTarget } from "../../RenderInterface/InternalRenderTarget";

/**
 * 将继承修改为类似 WebGLRenderingContextBase, WebGLRenderingContextOverloads 多继承 ?
 */
export class NativeGL2TextureContext extends NativeGLTextureContext {

    constructor(engine: NativeWebGLEngine, native: any) {
        super(engine, native);
    }
}