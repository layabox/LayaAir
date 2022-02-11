import { LayaGL } from "../../layagl/LayaGL";
import { TextureFormat } from "../../resource/TextureFormat";
import { DDSTextureInfo } from "../../resource/DDSTextureInfo";
import { BaseTexture1 } from "./BaseTexture";
import { TextureDimension } from "./InternalTexture";
import { KTXTextureInfo } from "../../resource/KTXTextureInfo";

export enum CubeFace {
    right,
    left,
    up,
    bottom,
    front,
    back
}

export class TextureCube extends BaseTexture1 {

    constructor(size: number, format: TextureFormat, mipmap: boolean = true, sRGB: boolean = false) {
        super(size, size, format);

        this._dimension = TextureDimension.Cube;

        this._texture = LayaGL.layaContext.createTextureInternal(this._dimension, size, size, format, mipmap, sRGB);
        return;
    }

    // todo source数组 改为 CubeInfo 结构体?
    setImageData(source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.layaContext.setCubeImageData(texture, source, premultiplyAlpha, invertY);
    }

    setPixelsData(source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.layaContext.setCubePixelsData(texture, source, premultiplyAlpha, invertY);
    }

    setDDSData(ddsInfo: DDSTextureInfo) {
        let texture = this._texture;
        LayaGL.layaContext.setCubeDDSData(texture, ddsInfo);
    }

    setKTXData(ktxInfo: KTXTextureInfo) {
        let texture = this._texture;
        LayaGL.layaContext.setCubeKTXData(texture, ktxInfo);
    }

}