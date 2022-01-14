import { Bitmap } from "../../resource/Bitmap";
import { FilterMode } from "../../resource/FilterMode";
import { TextureFormat } from "../../resource/TextureFormat";
import { WarpMode } from "../../resource/WrapMode";
import { SystemUtils } from "../../webgl/SystemUtils";
import { InternalTexture, TextureDimension } from "./InternalTexture";

export class BaseTexture extends Bitmap {

    protected _texture: InternalTexture;

    private _format: TextureFormat;
    public get format(): TextureFormat {
        return this._format;
    }

    constructor(width: number, height: number, format: TextureFormat) {
        super();
        this._width = width;
        this._height = height;
        this._format = format;
    }

    get dimension(): TextureDimension {
        return this._texture.dimension;
    }

    get filterMode(): FilterMode {
        return this._texture.filterMode;
    }

    set filterMode(value: FilterMode) {
        this._texture.filterMode = value;
    }

    get warpModeU(): WarpMode {
        return this._texture.warpModeU;
    }
    set warpModeU(value: WarpMode) {
        this._texture.warpModeU = value;
    }

    get warpModeV(): WarpMode {
        return this._texture.warpModeV;
    }
    set warpModeV(value: WarpMode) {
        this._texture.warpModeV = value;
    }

    get anisoLevel(): number {
        return this._texture.anisoLevel;
    }
    set anisoLevel(value: number) {
        this._texture.anisoLevel = value;
    }

    get mipmap(): boolean {
        return this._texture.mipmap;
    }

    get mipmapCount(): number {
        return this._texture.mipmapCount;
    }

    get premultiplyAlpha(): boolean {
        return this._texture.premultiplyAlpha;
    }

    get gammaCorrection(): number {
        return this._texture.gammaCorrection;
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