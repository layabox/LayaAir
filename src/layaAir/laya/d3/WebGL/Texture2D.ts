import { LayaGL } from "../../layagl/LayaGL";
import { FilterMode } from "../../resource/FilterMode";
import { TextureFormat } from "../../resource/TextureFormat";
import { WarpMode } from "../../resource/WrapMode";
import { DDSTextureInfo } from "../../webgl/DDSTextureInfo";
import { BaseTexture } from "./BaseTexture";
import { TextureDimension } from "./InternalTexture";

export class Texture2D extends BaseTexture {

    constructor(width: number, height: number, format: TextureFormat, mipmap: boolean = true, premultiplyAlpha: boolean = false, invertY: boolean = false, sRGB: boolean = false) {
        super(width, height, format, mipmap);
        this._dimension = TextureDimension.Tex2D;
        this._premultiplyAlpha = premultiplyAlpha;
        this._invertY = invertY;
        this._gammaSpace = !sRGB;
        return;
    }

    /**
     * 设置纹理数据
     * @param source 
     * @returns 
     */
    setImageData(source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap) {
        if (source.width != this.width || source.height != this.height) {
            console.warn("texture size is different with source size");
            return;
        }

        this._texture = LayaGL.layaRenderContext.createTextureInternal(this.width, this.height, this.format, this.mipmap, this.warpModeU, this.warpModeV, this.filterMode, this.anisoLevel, this.premultiplyAlpha, this.invertY, !this.gammaSpace);
        this._texture.updataSubImageData(source, 0, 0, 0);
        this._texture._setSampler();
    }

    setBufferdata(source: ArrayBufferView) {
        this._texture.updataSubPixelsData(source, 0, 0, this.width, this.height, 0);
        this._texture._setSampler();
    }

    setDDSData(source: ArrayBuffer) {
        let ddsInfo = DDSTextureInfo.getDDSTextureInfo(source);
        this._texture = LayaGL.layaRenderContext.createDDSTexture(source, ddsInfo, this.warpModeU, this.warpModeV, this.filterMode, this.anisoLevel, this.premultiplyAlpha, this.invertY, !this.gammaSpace);
    }

    generateMipmap(): boolean {
        return this._texture.generateMipmap();
    }

    updateSubImageData(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, xoffset: number, yoffset: number, mipmapLevel: number = 0) {
        this._texture.updataSubImageData(source, xoffset, yoffset, mipmapLevel);
    }

    updateSubPixelsData(source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number = 0) {
        this._texture.updataSubPixelsData(source, xoffset, yoffset, width, height, mipmapLevel);
    }

}