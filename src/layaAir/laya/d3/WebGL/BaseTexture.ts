import { Bitmap } from "../../resource/Bitmap";
import { FilterMode } from "../../resource/FilterMode";
import { TextureFormat } from "../../resource/TextureFormat";
import { WarpMode } from "../../resource/WrapMode";
import { InternalTexture, TextureDimension } from "./InternalTexture";

export class BaseTexture extends Bitmap {

    /**
     * @internal
     */
    _texture: InternalTexture;

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

    public get warpModeU(): WarpMode {
        return this._texture.warpU;
    }
    public set warpModeU(value: WarpMode) {
        this._texture.warpU = value;
    }

    public get warpModeV(): WarpMode {
        return this._texture.warpV;
    }
    public set warpModeV(value: WarpMode) {
        this._texture.warpV = value;
    }

    public get warpModeW(): WarpMode {
        return this._texture.warpW;
    }
    public set warpModeW(value: WarpMode) {
        this._texture.warpW = value;
    }

    public get gammaCorrection(): number {
        return this._texture.gammaCorrection;
    }

    protected _gammaSpace: boolean = false;
    // todo
    public get gammaSpace(): boolean {
        // return this._gammaSpace;

        return this._texture.useSRGBLoad || this._texture.gammaCorrection > 1;
    }

    constructor(width: number, height: number, format: TextureFormat,) {
        super();
        this._width = width;
        this._height = height;
        this._format = format;
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