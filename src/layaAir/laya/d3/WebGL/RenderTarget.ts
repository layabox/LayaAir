import { TextureFormat } from "../../resource/TextureFormat";
import { InternalRenderTarget } from "./InternalRenderTarget";

enum RenderTargetDepthFormat {
    /**深度格式_DEPTH_16。*/
    DEPTH_16 = 0,
    /**深度格式_STENCIL_8。*/
    STENCIL_8 = 1,
    /**深度格式_DEPTHSTENCIL_24_8。*/
    DEPTHSTENCIL_24_8 = 2,
    /**深度格式_DEPTHSTENCIL_NONE。*/
    DEPTHSTENCIL_NONE = 3,

    /**深度格式_DEPTH_32。*/
    DEPTH_32 = 4,
}

export enum RenderTargetFormat {

    R8G8B8 = TextureFormat.R8G8B8,
    R8G8B8A8 = TextureFormat.R8G8B8A8,
    R16G16B16 = TextureFormat.R16G16B16,
    R16G16B16A16 = TextureFormat.R16G16B16A16,
    R32G32B32 = TextureFormat.R32G32B32,
    R32G32B32A32 = TextureFormat.R32G32B32A32,

    DEPTH_16,
    STENCIL_8,
    DEPTHSTENCIL_24_8,
    DEPTH_32
}
// export type RenderTargetFormat = TextureFormat.R8G8B8 | TextureFormat.R8G8B8A8;

export interface RenderTarget {

    _renderTarget: InternalRenderTarget;

    _isCameraTarget: boolean;

    _start(): void;

    _end(): void;
}
