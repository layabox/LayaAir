import { LayaGL } from "../layagl/LayaGL";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { HDREncodeFormat } from "../RenderEngine/RenderEnum/HDREncodeFormat";
import { TextureCompareMode } from "../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../RenderEngine/RenderInterface/InternalTexture";
import { Resource } from "./Resource";

/**
 * <code>BaseTexture</code> 纹理的父类，抽象类，不允许实例。
 */
export class BaseTexture extends Resource {
    /**
     * @internal
     */
    _texture: InternalTexture;
    /**@internal */
    _hdrEncodeFormat:HDREncodeFormat;
    /**@private */
    protected _width: number;
    /**@private */
    protected _height: number;


    get hdrEncodeFormat(){
        return this._hdrEncodeFormat;
    }

    set hdrEncodeFormat(value:HDREncodeFormat){
        this._hdrEncodeFormat = value;
    }

    /**
     * 获取宽度。
     */
    get width(): number {
        return this._width;
    }

    set width(width: number) {
        this._width = width;
    }

    /***
     * 获取高度。
     */
    get height(): number {
        return this._height;
    }

    set height(height: number) {
        this._height = height;
    }

    protected _dimension: TextureDimension;
    public get dimension(): TextureDimension {
        return this._dimension;
    }

    private _format: TextureFormat;
    public get format(): TextureFormat {
        return this._format;
    }

    public get mipmap(): boolean {
        return this._texture.mipmap;
    }

    public get mipmapCount(): number {
        return this._texture.mipmapCount;
    }

    public get anisoLevel(): number {
        return this._texture.anisoLevel;
    }
    public set anisoLevel(value: number) {
        this._texture.anisoLevel = value;
    }

    public get filterMode(): FilterMode {
        return this._texture.filterMode;
    }
    public set filterMode(value: FilterMode) {
        this._texture.filterMode = value;
    }

    public get wrapModeU(): WrapMode {
        return this._texture.wrapU;
    }
    public set wrapModeU(value: WrapMode) {
        this._texture.wrapU = value;
    }

    public get wrapModeV(): WrapMode {
        return this._texture.wrapV;
    }
    public set wrapModeV(value: WrapMode) {
        this._texture.wrapV = value;
    }

    public get wrapModeW(): WrapMode {
        return this._texture.wrapW;
    }
    public set wrapModeW(value: WrapMode) {
        this._texture.wrapW = value;
    }

    public get compareMode(): TextureCompareMode {
        return this._texture.compareMode;
    }

    public set compareMode(value: TextureCompareMode) {
        this._texture.compareMode = LayaGL.textureContext.setTextureCompareMode(this._texture, value);
    }

    /**如果是1.0  texture2D直接采样就是linear */
    public get gammaCorrection(): number {
        return this._texture.gammaCorrection;
    }

    public set baseMipmapLevel(value: number) {
        this._texture.baseMipmapLevel = value;
    }

    public get baseMipmapLevel(): number {
        return this._texture.baseMipmapLevel;
    }

    public set maxMipmapLevel(value: number) {
        this._texture.maxMipmapLevel = value;
    }

    public get maxMipmapLevel(): number {
        return this._texture.maxMipmapLevel;
    }

    protected _gammaSpace: boolean = false;
    // todo
    public get gammaSpace(): boolean {
        // return this._gammaSpace;
        return this._texture.useSRGBLoad || this._texture.gammaCorrection > 1;
    }

    constructor(width: number, height: number, format: number) {
        super();
        this._width = width;
        this._height = height;
        this._format = format;
        this.destoryedImmediately = false;
        this.hdrEncodeFormat = HDREncodeFormat.NONE;
    }

    /**
     * 是否是gpu压缩纹理格式
     * @returns 
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

    _getSource() {
        return this._texture.resource;
    }

    get defaultTexture(): BaseTexture {
        throw "defaulte"
    }

    protected _disposeResource(): void {
        this._texture.dispose();
    }
}