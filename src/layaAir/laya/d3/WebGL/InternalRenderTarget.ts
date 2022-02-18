import { RenderTargetFormat } from "../../resource/RenderTarget";
import { InternalTexture } from "./InternalTexture";

export interface InternalRenderTarget {

    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    _textures: InternalTexture[];

    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

    dispose(): void;
}