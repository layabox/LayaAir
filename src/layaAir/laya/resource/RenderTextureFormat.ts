export enum RenderTextureFormat {
    /**RGB格式,每个通道8位。*/
    R8G8B8 = 0,
    /**RGBA格式,每个通道8位。*/
    R8G8B8A8 = 1,
    /**Alpha格式,8位。*/
    Alpha8 = 2,
    /**RGBA格式,每个通道16位。*/
    R16G16B16A16 = 14,
    /**深度格式。*/
    Depth = 15,
    /**阴影贴图格式格式。*/
    ShadowMap = 16
}

export enum RenderTextureDepthFormat {
    /**深度格式_DEPTH_16。*/
    DEPTH_16 = 0,
    /**深度格式_STENCIL_8。*/
    STENCIL_8 = 1,
    /**深度格式_DEPTHSTENCIL_24_8。*/
    DEPTHSTENCIL_24_8 = 2,
    /**深度格式_DEPTHSTENCIL_NONE。*/
    DEPTHSTENCIL_NONE = 3,

    /** @deprecated*/
    DEPTHSTENCIL_16_8 = 2,
}