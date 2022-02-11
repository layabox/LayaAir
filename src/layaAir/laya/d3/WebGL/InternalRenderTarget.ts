import { InternalTexture } from "./InternalTexture";

export interface InternalRenderTarget {

    _isMulti: boolean;
    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    _textures: InternalTexture[];

    _depthTexture: InternalTexture;

    dispose(): void;
}