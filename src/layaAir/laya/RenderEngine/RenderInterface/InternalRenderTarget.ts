import { Color } from "../../maths/Color";
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

    isSRGB:boolean;

    gpuMemory:number;

    dispose(): void;
}