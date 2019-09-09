export enum TextureFormat {
    /**纹理格式_R8G8B8。*/
    R8G8B8 = 0,
    /**纹理格式_R8G8B8A8。*/
    R8G8B8A8 = 1,
    /**纹理格式_ALPHA8。*/
    Alpha8 = 2,
    /**纹理格式_DXT1。*/
    DXT1 = 3,
    /**纹理格式_DXT5。*/
    DXT5 = 4,
    /**纹理格式_ETC2RGB。*/
    ETC1RGB = 5,
    ///**纹理格式_ETC2RGB。*/
    //ETC2RGB:int = 6;
    ///**纹理格式_ETC2RGBA。*/
    //ETC2RGBA:int = 7;
    /**纹理格式_ETC2RGB_PUNCHTHROUGHALPHA。*/
    //ETC2RGB_PUNCHTHROUGHALPHA:int = 8;
    /**纹理格式_PVRTCRGB_2BPPV。*/
    PVRTCRGB_2BPPV = 9,
    /**纹理格式_PVRTCRGBA_2BPPV。*/
    PVRTCRGBA_2BPPV = 10,
    /**纹理格式_PVRTCRGB_4BPPV。*/
    PVRTCRGB_4BPPV = 11,
    /**纹理格式_PVRTCRGBA_4BPPV。*/
    PVRTCRGBA_4BPPV = 12,
    /**RGBA格式纹理,每个通道32位浮点数。*/
    R32G32B32A32 = 15
}