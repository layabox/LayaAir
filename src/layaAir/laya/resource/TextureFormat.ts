export enum TextureFormat {
    /**纹理格式_R8G8B8。*/
    R8G8B8 = 0,
    /**纹理格式_R8G8B8A8。*/
    R8G8B8A8 = 1,
    /**RGB格式纹理,R通道5位，G通道6位，B通道5位。*/
    R5G6B5 = 16,
    /**纹理格式_ALPHA8。*/
    Alpha8 = 2,
    /**纹理格式_DXT1。*/
    DXT1 = 3,
    /**纹理格式_DXT5。*/
    DXT5 = 4,
    /**纹理格式_ETC2RGB。*/
    ETC1RGB = 5,
    ///**纹理格式_ETC2RGB。*/
    ETC2RGB = 6,
    ///**纹理格式_ETC2RGBA。*/
    ETC2RGBA = 7,
    /**纹理格式_ETC2RGB_PUNCHTHROUGHALPHA。*/
    //ETC2RGB_PUNCHTHROUGHALPHA:int = 8;
    /**纹理格式_PVRTCRGB_2BPPV。*/
    ETC2RGB_Alpha8 = 8,
    ETC2SRGB = 28,
    PVRTCRGB_2BPPV = 9,
    /**纹理格式_PVRTCRGBA_2BPPV。*/
    PVRTCRGBA_2BPPV = 10,
    /**纹理格式_PVRTCRGB_4BPPV。*/
    PVRTCRGB_4BPPV = 11,
    /**纹理格式_PVRTCRGBA_4BPPV。*/
    PVRTCRGBA_4BPPV = 12,
    /**RGBA格式纹理,每个通道32位浮点数。*/
    R32G32B32A32 = 15,
    /**RGBA格式纹理，每个通道16位浮点数。 */
    R16G16B16A16 = 17,
    /**ASTC 4x4*/
    ASTC4x4 = 18,
    /**ASTC sRGB 4x4 */
    ASTC4x4SRGB = 23,
    /**ASTC 6x6*/
    ASTC6x6 = 19,
    /**ASTC  6x6*/
    ASTC6x6SRGB = 24,
    /**ASTC 8x8 */
    ASTC8x8 = 20,
    ASTC8x8SRGB = 25,
    /**ASTC 10x10 */
    ASTC10x10 = 21,
    ASTC10x10SRGB = 26,
    /**ASTC 12x12 */
    ASTC12x12 = 22,
    ASTC12x12SRGB = 27,


    /**ktx图片 */
    KTXTEXTURE = -1,
    /**pvr图片 */
    PVRTEXTURE = -2


}