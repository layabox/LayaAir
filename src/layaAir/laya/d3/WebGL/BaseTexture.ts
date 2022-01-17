import { Bitmap } from "../../resource/Bitmap";
import { FilterMode } from "../../resource/FilterMode";
import { TextureFormat } from "../../resource/TextureFormat";
import { WarpMode } from "../../resource/WrapMode";
import { InternalTexture, TextureDimension } from "./InternalTexture";

export class BaseTexture extends Bitmap {

    protected _texture: InternalTexture;

    private _format: TextureFormat;
    public get format(): TextureFormat {
        return this._format;
    }

    constructor(width: number, height: number, format: TextureFormat, mipmap: boolean) {
        super();
        this._width = width;
        this._height = height;
        this._format = format;
        this._mipmap = mipmap
    }

    protected _dimension: TextureDimension;
    public get dimension(): TextureDimension {
        return this._dimension;
    }

    protected _filterMode: FilterMode = FilterMode.Bilinear;
    public get filterMode(): FilterMode {
        return this._filterMode;
    }
    public set filterMode(value: FilterMode) {
        this._filterMode = value;
    }

    protected _warpModeU: WarpMode = WarpMode.Repeat;
    public get warpModeU(): WarpMode {
        return this._warpModeU;
    }
    public set warpModeU(value: WarpMode) {
        if (this._warpModeU != value && this._texture) {
            this._texture.warpModeU = value;
        }
    }

    protected _warpModeV: WarpMode = WarpMode.Repeat;
    public get warpModeV(): WarpMode {
        return this._warpModeV;
    }
    public set warpModeV(value: WarpMode) {
        this._warpModeV = value;
    }

    protected _warpModeW: WarpMode = WarpMode.Repeat;
    public get warpModeW(): WarpMode {
        return this._warpModeW;
    }
    public set warpModeW(value: WarpMode) {
        this._warpModeW = value;
    }

    protected _anisoLevel: number = 4;
    public get anisoLevel(): number {
        return this._anisoLevel;
    }
    public set anisoLevel(value: number) {
        this._anisoLevel = value;
    }

    protected _mipmap: boolean = true;
    public get mipmap(): boolean {
        return this._mipmap;
    }

    protected _mipmapCount: number = 1;
    public get mipmapCount(): number {
        return this._mipmapCount;
    }

    protected _premultiplyAlpha: boolean = false;
    public get premultiplyAlpha(): boolean {
        return this._premultiplyAlpha;
    }

    protected _invertY: boolean = false;
    public get invertY(): boolean {
        return this._invertY;
    }

    public get gammaCorrection(): number {
        return this._texture.gammaCorrection;
    }

    protected _gammaSpace: boolean = false;
    public get gammaSpace(): boolean {
        return this._gammaSpace;
    }
    // todo  允许动态更改？ 只在加载时设置？ 
    public set gammaSpace(value: boolean) {
        this._gammaSpace = value;
    }

    gpuCompressFormat(): boolean {
        let format = this._format;
        switch (format) {
            case TextureFormat.R8G8B8:
            case TextureFormat.R8G8B8A8:
                return false;
            case TextureFormat.ASTC4x4:
                return true;
            default:
                return false;
        }
    }

    _getSource(): InternalTexture {
        return this._texture.resource;
    }

    protected _disposeResource(): void {
        this._texture.dispose();
    }

}