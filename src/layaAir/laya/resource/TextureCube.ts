import { LayaGL } from "../layagl/LayaGL";
import { DDSTextureInfo } from "../RenderEngine/DDSTextureInfo";
import { KTXTextureInfo } from "../RenderEngine/KTXTextureInfo";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { BaseTexture } from "./BaseTexture";

export enum TextureCubeFace {
    /**+x */
    PositiveX,
    /**-x */
    NegativeX,
    /**+y */
    PositiveY,
    /**-y */
    NegativeY,
    /**+z */
    PositiveZ,
    /**-z */
    NegativeZ
}

const DEFAULT_PIXELS: Uint8Array = new Uint8Array(4);

/**
 * <code>TextureCube</code> 类用于生成立方体纹理。
 */
export class TextureCube extends BaseTexture {

    /**@private*/
    private static _blackTexture: TextureCube;
    /**@private*/
    private static _grayTexture: TextureCube;
    /**@private*/
    private static _whiteTexture: TextureCube;

    private static _errorTexture: TextureCube;

    /**
     * 黑色纯色纹理。
     */
    static get blackTexture() {
        return TextureCube._blackTexture;
    }

    /**
     * 灰色纯色纹理。
     */
    static get grayTexture() {
        return TextureCube._grayTexture;
    }

    /**
     * 白色纯色纹理。
     */
    static get whiteTexture() {
        return TextureCube._whiteTexture;
    }

    static get errorTexture() {
        return TextureCube._errorTexture;
    }

    /**
     * @internal
     */
    static __init__(): void {
        var blackTexture: TextureCube = new TextureCube(1, TextureFormat.R8G8B8A8, false);
        var grayTexture: TextureCube = new TextureCube(1, TextureFormat.R8G8B8A8, false);
        var writeTexture:TextureCube = new TextureCube(1,TextureFormat.R8G8B8A8,false);
        var pixels = DEFAULT_PIXELS;
        pixels[0] = 0, pixels[1] = 0, pixels[2] = 0;pixels[3] = 255;
        blackTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
        blackTexture.lock = true;//锁住资源防止被资源管理释放
        return;
        pixels[0] = 128, pixels[1] = 128, pixels[2] = 128;pixels[3] = 255;
        grayTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
        grayTexture.lock = true;//锁住资源防止被资源管理释放
        pixels[0] = 255, pixels[1] = 255, pixels[2] = 255;pixels[3] = 255;
        writeTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
        writeTexture.lock = true;
        TextureCube._grayTexture = grayTexture;
        TextureCube._blackTexture = blackTexture;
        TextureCube._whiteTexture = writeTexture;
        TextureCube._errorTexture = writeTexture;
    }

    constructor(size: number, format: TextureFormat, mipmap: boolean = true, sRGB: boolean = false) {
        super(size, size, format);

        this._dimension = TextureDimension.Cube;

        this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, size, size, format, mipmap, sRGB);
        return;
    }

    // todo source数组 改为 CubeInfo 结构体?
    setImageData(source: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean) {
        let error = false;
        let k = source.findIndex(s => s != null);
        if (k != -1) {
            let img = source[k];
            if (!source.every(s => s != null && s.width == img.width && s.height == img.height)) //必须满足所有元素不为null且大小相等
                error = true;
        }
        else
            error = true;

        let texture = this._texture;
        if (!error)
            LayaGL.textureContext.setCubeImageData(texture, source, premultiplyAlpha, invertY);
        else {
            let pixels = DEFAULT_PIXELS;
            LayaGL.textureContext.setCubePixelsData(texture, [pixels, pixels, pixels, pixels, pixels, pixels], premultiplyAlpha, invertY);
        }
    }

    setPixelsData(source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.textureContext.setCubePixelsData(texture, source, premultiplyAlpha, invertY);
    }

    updateSubPixelsData(source: ArrayBufferView[], xOffset: number, yOffset: number, width: number, height: number, mipmapLevel: number, generateMipmap: boolean, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.textureContext.setCubeSubPixelData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }

    setDDSData(ddsInfo: DDSTextureInfo) {
        let texture = this._texture;
        LayaGL.textureContext.setCubeDDSData(texture, ddsInfo);
    }

    setKTXData(ktxInfo: KTXTextureInfo) {
        let texture = this._texture;
        LayaGL.textureContext.setCubeKTXData(texture, ktxInfo);
    }

    get defaultTexture(): BaseTexture {
        return TextureCube.grayTexture;
    }
}