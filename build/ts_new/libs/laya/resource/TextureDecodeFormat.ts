/**
 * 纹理解码格式。
 */
export enum TextureDecodeFormat {
    /** 常规解码方式,直接采样纹理颜色。*/
    Normal,
    /** 按照RGBM方式解码并计算最终RGB颜色。 */
    RGBM
}