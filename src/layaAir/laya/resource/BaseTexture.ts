import { Config } from "../../Config";
import { InternalTexture } from "../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { HDREncodeFormat } from "../RenderEngine/RenderEnum/HDREncodeFormat";
import { TextureCompareMode } from "../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { LayaGL } from "../layagl/LayaGL";
import { Resource } from "./Resource";

/**
 * @en The `BaseTexture` class is an abstract class and serves as the base class for textures. It should not be instantiated directly.
 * @zh `BaseTexture` 类是纹理的父类，是一个抽象类，不允许直接实例化。
 */
export class BaseTexture extends Resource {
    /**
     * @internal
     */
    _texture: InternalTexture;
    /**@internal */
    hdrEncodeFormat: HDREncodeFormat;
    /**@private */
    protected _width: number;
    /**@private */
    protected _height: number;

    /**
     * @en The width of the texture.
     * @zh 纹理的宽度。
     */
    get width(): number {
        return this._width;
    }

    set width(width: number) {
        this._width = width;
    }

    /**
     * @en The height of the texture.
     * @zh 纹理的高度。
     */
    get height(): number {
        return this._height;
    }

    set height(height: number) {
        this._height = height;
    }

    protected _dimension: TextureDimension;

    /**
     * @en The texture dimension.
     * @zh 纹理几何属性
     */
    public get dimension(): TextureDimension {
        return this._dimension;
    }

    protected _format: TextureFormat;
    /**
     * @en The format of the texture.
     * @zh 纹理的格式。
     */
    public get format(): TextureFormat {
        return this._format;
    }

    /**
     * @en Whether to generate mipmap
     * @zh 是否生成mipmap
     */
    public get mipmap(): boolean {
        return this._texture.mipmap;
    }

    /**
     * @en The number of mipmap generated for this texture.
     * @zh 为此纹理生成的mipmap数量。
     */
    public get mipmapCount(): number {
        return this._texture.mipmapCount;
    }

    /**
     * @en The anisotropy value of texture
     * @zh 纹理的各向异性值
     */
    public get anisoLevel(): number {
        return this._texture.anisoLevel;
    }
    public set anisoLevel(value: number) {
        this._texture.anisoLevel = value;
    }

    /**
     * @en The sampling filtering mode of the texture.
     * @zh 纹理的采样过滤模式。
     */
    public get filterMode(): FilterMode {
        return this._texture.filterMode;
    }
    public set filterMode(value: FilterMode) {
        this._texture.filterMode = value;
    }

    /**
     * @en U-direction sampling mode
     * @zh U方向采样模式
     */
    public get wrapModeU(): WrapMode {
        return this._texture.wrapU;
    }
    public set wrapModeU(value: WrapMode) {
        this._texture.wrapU = value;
    }

    /**
     * @en V-direction sampling mode
     * @zh V方向采样模式
     */
    public get wrapModeV(): WrapMode {
        return this._texture.wrapV;
    }
    public set wrapModeV(value: WrapMode) {
        this._texture.wrapV = value;
    }

    /**
     * @en W-direction sampling mode
     * @zh W方向采样模式
     */
    public get wrapModeW(): WrapMode {
        return this._texture.wrapW;
    }
    public set wrapModeW(value: WrapMode) {
        this._texture.wrapW = value;
    }

    /**
     * @en The texture compare mode.
     * @zh 贴图压缩格式
     */
    public get compareMode(): TextureCompareMode {
        return this._texture.compareMode;
    }

    public set compareMode(value: TextureCompareMode) {
        this._texture.compareMode = LayaGL.textureContext.setTextureCompareMode(this._texture, value);
    }

    /**
     * @en Gets the gamma correction value of the texture. If set to 1.0, texture sampling will be linear without any correction.
     * @zh 获取纹理的伽马校正值。如果设置为1.0，则纹理采样将为线性，不进行任何校正。
     */
    public get gammaCorrection(): number {
        return this._texture.gammaCorrection;
    }

    /**
     * @en The base mipmap level of the texture.
     * @zh 纹理的mipmap起始等级。
     */
    public get baseMipmapLevel(): number {
        return this._texture.baseMipmapLevel;
    }

    public set baseMipmapLevel(value: number) {
        this._texture.baseMipmapLevel = value;
    }

    /**
     * @en The maximum mipmap level of the texture.
     * @zh 纹理的最大mipmap等级。
     */
    public get maxMipmapLevel(): number {
        return this._texture.maxMipmapLevel;
    }

    public set maxMipmapLevel(value: number) {
        this._texture.maxMipmapLevel = value;
    }


    /**@internal */
    _gammaSpace: boolean = false;
    // todo
    /**
     * @en Gets whether the texture is using gamma space.
     * @zh 判断纹理是否使用伽马空间。
     */
    public get gammaSpace(): boolean {
        // return this._gammaSpace;
        return this._texture.useSRGBLoad || this._texture.gammaCorrection > 1;
    }

    /**
     * @en Creates an instance of BaseTexture.
     * @param width The width of the texture.
     * @param height The height of the texture.
     * @param format The format of the texture, specified as a number.
     * @zh 实例化一个纹理
     * @param width 纹理的宽度。
     * @param height 纹理的高度。
     * @param format 纹理的格式，以数字形式指定。
     */
    constructor(width: number, height: number, format: number) {
        super();
        this._width = width;
        this._height = height;
        this._format = format;
        this.destroyedImmediately = Config.destroyResourceImmediatelyDefault;
        this.hdrEncodeFormat = HDREncodeFormat.NONE;
    }

    /**
     * @en Checks if the texture is in a GPU compressed format.
     * @returns True if the texture is in a GPU compressed format, otherwise false.
     * @zh 是否是gpu压缩纹理格式
     * @returns 如果纹理是gpu压缩格式，则返回true，否则返回false。
     */
    gpuCompressFormat(): boolean {
        let format = this._format;
        switch (format) {
            case TextureFormat.R8G8B8:
            case TextureFormat.R8G8B8A8:
            case TextureFormat.R16G16B16:
            case TextureFormat.R16G16B16A16:
            case TextureFormat.R32G32B32:
            case TextureFormat.R32G32B32A32:
            case TextureFormat.R5G6B5:
            case TextureFormat.Alpha8:
                return false;
            case TextureFormat.DXT1:
            case TextureFormat.DXT3:
            case TextureFormat.DXT5:
            case TextureFormat.ETC1RGB:
            case TextureFormat.ETC2RGB:
            case TextureFormat.ETC2RGBA:
            case TextureFormat.ETC2SRGB_Alpha8:
            case TextureFormat.ETC2SRGB:
            case TextureFormat.PVRTCRGB_2BPPV:
            case TextureFormat.PVRTCRGBA_2BPPV:
            case TextureFormat.PVRTCRGB_4BPPV:
            case TextureFormat.PVRTCRGBA_4BPPV:
            case TextureFormat.ASTC4x4:
            case TextureFormat.ASTC4x4SRGB:
            case TextureFormat.ASTC6x6:
            case TextureFormat.ASTC6x6SRGB:
            case TextureFormat.ASTC8x8:
            case TextureFormat.ASTC8x8SRGB:
            case TextureFormat.ASTC10x10:
            case TextureFormat.ASTC10x10SRGB:
            case TextureFormat.ASTC12x12:
            case TextureFormat.ASTC12x12SRGB:
                return true;
            default:
                return false;
        }
    }

    /**
     * 获取纹理格式的字节数
     * @internal
     */
    _getFormatByteCount(): number {
        switch (this._format) {
            case TextureFormat.R8G8B8:
                return 3;
            case TextureFormat.R8G8B8A8:
                return 4;
            case TextureFormat.R5G6B5:
                return 1;
            case TextureFormat.Alpha8:
                return 1;
            case TextureFormat.R16G16B16A16:
                return 2;
            case TextureFormat.R32G32B32A32:
                return 4;
            default:
                throw "Texture2D: unknown format.";
        }
    }

    /**
     * @internal
     * @returns 
     */
    _getSource() {
        return this._texture.resource;
    }

    /**
     * @en The default texture.
     * @zh 默认贴图
     */
    get defaultTexture(): BaseTexture {
        throw "defaulte"
    }

    protected _disposeResource(): void {
        this._texture.dispose();
    }
}