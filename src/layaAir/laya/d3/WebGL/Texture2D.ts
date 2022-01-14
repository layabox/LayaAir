import { LayaGL } from "../../layagl/LayaGL";
import { FilterMode } from "../../resource/FilterMode";
import { TextureFormat } from "../../resource/TextureFormat";
import { WarpMode } from "../../resource/WrapMode";
import { BaseTexture } from "./BaseTexture";

export class Texture2D extends BaseTexture {

    constructor(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width: number, height: number, format: TextureFormat, mipmap: boolean = true, premultiplyAlpha: boolean = false, invertY: boolean = false, sRGB: boolean = false) {
        super(source.width, source.height, format);

        let warpU = WarpMode.Repeat;
        let warpV = WarpMode.Clamp;

        let filter = FilterMode.Bilinear;
        let anisoLevel = 4;

        // todo arraybuffer data
        if (!source.width) {
            // @ts-ignore
            let pixels = <ArrayBufferView>source;

            // 直接创建时传入纹理数据
            // this._texture = LayaGL.layaRenderContext.createArrayBufferTexture2D(pixels, source.width || width, source.height || height, format, mipmap, warpU, warpV, filter, anisoLevel, premultiplyAlpha, invertY, sRGB);

            // 创建空纹理, 后填充纹理数据
            this._texture = LayaGL.layaRenderContext.createInternalTexture(width, height, format, mipmap, warpU, warpV, filter, anisoLevel, premultiplyAlpha, invertY, sRGB);
            this.updateSubPixelsData(pixels, 0, 0, width, height, 0);
            this._texture._setSampler();
        }
        else {

            // 直接创建时传入纹理数据
            // this._texture = LayaGL.layaRenderContext.createImgTexture2D(source, source.width || width, source.height || height, format, mipmap, warpU, warpV, filter, anisoLevel, premultiplyAlpha, invertY, sRGB);

            // 创建空纹理, 后填充纹理数据
            this._texture = LayaGL.layaRenderContext.createInternalTexture(source.width, source.height, format, mipmap, warpU, warpV, filter, anisoLevel, premultiplyAlpha, invertY, sRGB);
            this.updateSubImageData(source, 0, 0, 0);
            this._texture._setSampler();
        }
    }

    setImageData(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap) {
        // if (!this._texture) {
        //     this._texture = LayaGL.layaRenderContext.createImgTexture2D(source, source.width, source.height, this.format, this.mipmap, this)
        // }
    }

    setBufferdata() {

    }

    generateMipmap(): boolean {
        return this._texture.generateMipmap();
    }

    updateSubImageData(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, xoffset: number, yoffset: number, mipmapLevel: number = 0) {
        LayaGL.layaRenderContext.updataSubImageData(this, source, xoffset, yoffset, mipmapLevel);
    }

    updateSubPixelsData(source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number = 0) {
        LayaGL.layaRenderContext.updataSubPixelsData(this, source, xoffset, yoffset, width, height, mipmapLevel);
    }

}