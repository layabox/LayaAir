import { RenderTargetFormat } from "../RenderEnum/RenderTargetFormat";
import { InternalTexture } from "./InternalTexture";


export interface InternalRenderTarget {

    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    _textures: InternalTexture[];

    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

    gpuMemory:number;

    dispose(): void;
}