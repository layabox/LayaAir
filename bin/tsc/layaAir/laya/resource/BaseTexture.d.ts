import { Bitmap } from "./Bitmap";
/**
 * <code>BaseTexture</code> 纹理的父类，抽象类，不允许实例。
 */
export declare class BaseTexture extends Bitmap {
    /** @private */
    static WARPMODE_REPEAT: number;
    /** @private */
    static WARPMODE_CLAMP: number;
    /**寻址模式_重复。*/
    static FILTERMODE_POINT: number;
    /**寻址模式_不循环。*/
    static FILTERMODE_BILINEAR: number;
    /**寻址模式_不循环。*/
    static FILTERMODE_TRILINEAR: number;
    /**纹理格式_R8G8B8。*/
    static FORMAT_R8G8B8: number;
    /**纹理格式_R8G8B8A8。*/
    static FORMAT_R8G8B8A8: number;
    /**纹理格式_ALPHA8。*/
    static FORMAT_ALPHA8: number;
    /**纹理格式_DXT1。*/
    static FORMAT_DXT1: number;
    /**纹理格式_DXT5。*/
    static FORMAT_DXT5: number;
    /**纹理格式_ETC2RGB。*/
    static FORMAT_ETC1RGB: number;
    /**纹理格式_ETC2RGB_PUNCHTHROUGHALPHA。*/
    /**纹理格式_PVRTCRGB_2BPPV。*/
    static FORMAT_PVRTCRGB_2BPPV: number;
    /**纹理格式_PVRTCRGBA_2BPPV。*/
    static FORMAT_PVRTCRGBA_2BPPV: number;
    /**纹理格式_PVRTCRGB_4BPPV。*/
    static FORMAT_PVRTCRGB_4BPPV: number;
    /**纹理格式_PVRTCRGBA_4BPPV。*/
    static FORMAT_PVRTCRGBA_4BPPV: number;
    /**渲染纹理格式_16位半精度RGBA浮点格式。*/
    static RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT: number;
    /**深度格式_DEPTH_16。*/
    static FORMAT_DEPTH_16: number;
    /**深度格式_STENCIL_8。*/
    static FORMAT_STENCIL_8: number;
    /**深度格式_DEPTHSTENCIL_16_8。*/
    static FORMAT_DEPTHSTENCIL_16_8: number;
    /**深度格式_DEPTHSTENCIL_NONE。*/
    static FORMAT_DEPTHSTENCIL_NONE: number;
    /** @private */
    protected _readyed: boolean;
    /** @private */
    protected _glTextureType: number;
    /** @private */
    protected _glTexture: any;
    /** @private */
    protected _format: number;
    /** @private */
    protected _mipmap: boolean;
    /** @private */
    protected _wrapModeU: number;
    /** @private */
    protected _wrapModeV: number;
    /** @private */
    protected _filterMode: number;
    /** @private */
    protected _anisoLevel: number;
    /**
     * 是否使用mipLevel
     */
    readonly mipmap: boolean;
    /**
     * 纹理格式
     */
    readonly format: number;
    /**
     * 获取纹理横向循环模式。
     */
    /**
    * 设置纹理横向循环模式。
    */
    wrapModeU: number;
    /**
     * 获取纹理纵向循环模式。
     */
    /**
    * 设置纹理纵向循环模式。
    */
    wrapModeV: number;
    /**
     * 缩小过滤器
     */
    /**
    * 缩小过滤器
    */
    filterMode: number;
    /**
     * 各向异性等级
     */
    /**
    * 各向异性等级
    */
    anisoLevel: number;
    /**
     * 获取默认纹理资源。
     */
    readonly defaulteTexture: BaseTexture;
    /**
     * 创建一个 <code>BaseTexture</code> 实例。
     */
    constructor(format: number, mipMap: boolean);
    /**
     * @private
     */
    protected _isPot(size: number): boolean;
    /**
     * @private
     */
    protected _getGLFormat(): number;
    /**
     * @private
     */
    protected _setFilterMode(value: number): void;
    /**
     * @private
     */
    protected _setWarpMode(orientation: number, mode: number): void;
    /**
     * @private
     */
    protected _setAnisotropy(value: number): void;
    /**
     * @inheritDoc
     */
    protected _disposeResource(): void;
    /**
     * 获取纹理资源。
     */
    _getSource(): any;
    /**
     * 通过基础数据生成mipMap。
     */
    generateMipmap(): void;
}
