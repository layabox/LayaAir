import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalTexture } from "./InternalTexture";

export interface InternalRenderTarget {

    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    _textures: InternalTexture[];
    _texturesResolve?: InternalTexture[]; //为了支持MSAA，需要这个纹理接口

    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

    isSRGB:boolean;

    gpuMemory:number;

    dispose(): void;
}