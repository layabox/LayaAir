import { LayaGL } from "../../layagl/LayaGL";
import { TextureFormat } from "../../resource/TextureFormat";
import { DDSTextureInfo } from "../../resource/DDSTextureInfo";
import { HDRTextureInfo } from "../../resource/HDRTextureInfo";
import { BaseTexture1 } from "./BaseTexture";
import { TextureDimension } from "./InternalTexture";
import { KTXTextureInfo } from "../../resource/KTXTextureInfo";

export class Texture2D1 extends BaseTexture1 {

    constructor(width: number, height: number, format: TextureFormat, mipmap: boolean = true, sRGB: boolean = false) {
        super(width, height, format);
        this._dimension = TextureDimension.Tex2D;
        this._gammaSpace = !sRGB;

        this._texture = LayaGL.layaContext.createTextureInternal(this._dimension, width, height, format, mipmap, sRGB);
        return;
    }

    setImageData(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.layaContext.setTextureImageData(texture, source, premultiplyAlpha, invertY);
    }

    setPixelsData(source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.layaContext.setTexturePixelsData(texture, source, premultiplyAlpha, invertY);
    }

    setDDSData(ddsInfo: DDSTextureInfo) {
        let texture = this._texture;
        LayaGL.layaContext.setTextureDDSData(texture, ddsInfo);
    }

    setKTXData(ktxInfo: KTXTextureInfo) {
        let texture = this._texture;
        LayaGL.layaContext.setTextureKTXData(texture, ktxInfo);
    }

    setHDRData(hdrInfo: HDRTextureInfo) {
        let texture = this._texture;
        LayaGL.layaContext.setTextureHDRData(texture, hdrInfo);
    }
}