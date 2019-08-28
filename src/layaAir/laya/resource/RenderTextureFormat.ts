export enum RenderTextureFormat {
    /**纹理格式_R8G8B8。*/
    R8G8B8 = 0,
    /**纹理格式_R8G8B8A8。*/
    R8G8B8A8 = 1,
    /**纹理格式_ALPHA8。*/
    Alpha8 = 2,
    /**渲染纹理格式_16位半精度RGBA浮点格式。*/
    RGBA_HALF_FLOAT = 14
}

export enum RenderTextureDepthFormat {
    /**深度格式_DEPTH_16。*/
    DEPTH_16 = 0,
    /**深度格式_STENCIL_8。*/
    STENCIL_8 = 1,
    /**深度格式_DEPTHSTENCIL_16_8。*/
    DEPTHSTENCIL_16_8 = 2,
    /**深度格式_DEPTHSTENCIL_NONE。*/
    DEPTHSTENCIL_NONE = 3
}