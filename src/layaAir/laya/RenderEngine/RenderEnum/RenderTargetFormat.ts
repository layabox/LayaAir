import { TextureFormat } from "./TextureFormat";

export enum RenderTargetFormat {
 
    None = -1,
    /**使用RGB的纹理，不可设置SRGB参数 */
    R8G8B8 = TextureFormat.R8G8B8,
    R8G8B8A8 = TextureFormat.R8G8B8A8,
    R16G16B16A16 = TextureFormat.R16G16B16A16,
    R32G32B32 = TextureFormat.R32G32B32,
    R32G32B32A32 = TextureFormat.R32G32B32A32,
    R16G16B16 = TextureFormat.R16G16B16,
    
    DEPTH_16 = 35,
    STENCIL_8 = 36,
    DEPTHSTENCIL_24_8 = 37,
    DEPTH_32 = 38
}