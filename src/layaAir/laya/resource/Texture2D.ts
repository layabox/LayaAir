import { ILaya } from "../../ILaya";
import { Handler } from "../utils/Handler";
import { BaseTexture } from "./BaseTexture";
import { Byte } from "../utils/Byte";
import { HalfFloatUtils } from "../utils/HalfFloatUtils";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { DDSTextureInfo } from "../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../RenderEngine/KTXTextureInfo";
import { RenderCapable } from "../RenderEngine/RenderEnum/RenderCapable";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { LayaEnv } from "../../LayaEnv";
import { HDREncodeFormat } from "../RenderEngine/RenderEnum/HDREncodeFormat";
import { LayaGL } from "../layagl/LayaGL";

/**
 * @en Interface for texture property parameters.
 * @zh 纹理属性参数接口。
 */
export interface TexturePropertyParams {
    /**
     * @en Texture U-coordinate line break mode.
     * @zh 纹理 U 坐标换行模式。
     */
    wrapModeU?: number,
    /**
     * @en Texture V-coordinate line break mode.
     * @zh 纹理 V 坐标换行模式。
     */
    wrapModeV?: number,
    /**
     * @en The filter mode for the texture.
     * @zh 纹理的过滤模式。
     */
    filterMode?: FilterMode,
    /**
     * @en The anisotropic filtering level for the texture.
     * @zh 纹理的各向异性过滤级别。
     */
    anisoLevel?: number,
    /**
     * @en Whether to premultiply the alpha channel.
     * @zh 是否预乘alpha通道。
     */
    premultiplyAlpha?: boolean,
    /**
     * @en The HDR encoding format for the texture.
     * @zh 纹理的HDR编码格式。
     */
    hdrEncodeFormat?: HDREncodeFormat,
}

export type TextureConstructParams = ConstructorParameters<typeof Texture2D>;

/**
 * @en The Texture2D class is used to generate 2D textures.
 * @zh Texture2D 类用于生成2D纹理。
 */
export class Texture2D extends BaseTexture {
    /**
     * @en The identifier for Texture2D resources.
     * @zh Texture2D 资源的标识符。
     */
    static TEXTURE2D: string = "TEXTURE2D";

    /**
     * @en A pure gray texture.
     * @zh 纯灰色纹理。
     */
    static grayTexture: Texture2D = null;
    /**
     * @en A pure white texture.
     * @zh 纯白色纹理。
     */
    static whiteTexture: Texture2D = null;
    /**
     * @en A pure black texture.
     * @zh 纯黑色纹理。
     */
    static blackTexture: Texture2D = null;
    /**
     * @en The default normal map texture.
     * @zh 默认法线纹理。
     */
    static normalTexture: Texture2D = null;
    /**
     * @en The error texture displayed when a texture fails to load.
     * @zh 当纹理加载失败时显示的错误纹理。
     */
    static errorTexture: Texture2D = null;

    /**
     * @internal
     */
    static __init__() {
        var pixels: Uint8Array = new Uint8Array(4);
        pixels[0] = 128;
        pixels[1] = 128;
        pixels[2] = 128;
        pixels[3] = 255;
        Texture2D.grayTexture = new Texture2D(1, 1, TextureFormat.R8G8B8A8, false, false);
        Texture2D.grayTexture.setPixelsData(pixels, false, false);
        Texture2D.grayTexture.lock = true;//锁住资源防止被资源管理释放
        Texture2D.grayTexture.name = "Default_Gray";
        pixels[0] = 255;
        pixels[1] = 255;
        pixels[2] = 255;
        pixels[3] = 255;
        Texture2D.whiteTexture = new Texture2D(1, 1, TextureFormat.R8G8B8A8, false, false);
        Texture2D.whiteTexture.setPixelsData(pixels, false, false);
        Texture2D.whiteTexture.lock = true;//锁住资源防止被资源管理释放
        Texture2D.whiteTexture.name = "Default_White";
        pixels[0] = 0;
        pixels[1] = 0;
        pixels[2] = 0;
        pixels[3] = 255;
        Texture2D.blackTexture = new Texture2D(1, 1, TextureFormat.R8G8B8A8, false, false);
        Texture2D.blackTexture.setPixelsData(pixels, false, false);
        Texture2D.blackTexture.lock = true;//锁住资源防止被资源管理释放
        Texture2D.blackTexture.name = "Default_Black";
        if (LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R16G16B16A16)) {
            let floatPixle = new Uint16Array(4);
            floatPixle[0] = 14336;
            floatPixle[1] = 14336;
            floatPixle[2] = 15360;
            floatPixle[3] = 15360;
            Texture2D.normalTexture = new Texture2D(1, 1, TextureFormat.R16G16B16A16, false, false, false);
            Texture2D.normalTexture.setPixelsData(floatPixle, false, false);
        }
        else {
            pixels[0] = 128;
            pixels[1] = 128;
            pixels[2] = 255;
            pixels[3] = 255;
            Texture2D.normalTexture = new Texture2D(1, 1, TextureFormat.R8G8B8A8, false, false, false);
            Texture2D.normalTexture.setPixelsData(pixels, false, false);
        }

        Texture2D.normalTexture.lock = true;
        Texture2D.normalTexture.name = "Default_Normal";
        Texture2D.errorTexture = Texture2D.whiteTexture;
    }


    /**
     * @internal
     * @param data 
     * @param propertyParams 
     * @param constructParams 
     * @returns 
     */
    static _SimpleAnimatorTextureParse(data: ArrayBuffer, propertyParams: TexturePropertyParams = null, constructParams: TextureConstructParams = null) {
        var byte: Byte = new Byte(data);
        var version: String = byte.readUTFString();
        var texture: Texture2D;
        var pixelDataArrays: Float32Array | Uint16Array;
        var usePixelData: Float32Array | Uint16Array;
        switch (version) {
            case "LAYAANIMATORTEXTURE:0000":
                var textureWidth: number = byte.readInt32();
                var pixelDataLength: number = byte.readInt32();
                pixelDataArrays = new Float32Array(textureWidth * textureWidth * 4);
                usePixelData = new Float32Array(byte.readArrayBuffer(pixelDataLength * 4));
                pixelDataArrays.set(usePixelData, 0);
                var texture: Texture2D = new Texture2D(textureWidth, textureWidth, TextureFormat.R32G32B32A32, false, false);
                texture.setPixelsData(pixelDataArrays, false, false);
                texture.filterMode = FilterMode.Point;
                break;
            case "LAYACOMPRESSANIMATORTEXTURE:0000":
                var textureWidth: number = byte.readInt32();
                var pixelDataLength: number = byte.readInt32();
                pixelDataArrays = new Uint16Array(byte.readArrayBuffer(pixelDataLength * 2));
                if (!LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R16G16B16A16)) {
                    console.log("The platform does not support 16-bit floating-point textures");
                    if (!LayaGL.renderEngine.getCapable(RenderCapable.TextureFormat_R32G32B32A32))
                        console.error("The platform does not support 32-bit floating-point textures");
                    usePixelData = new Float32Array(textureWidth * textureWidth * 4);
                    for (var i = 0, n = pixelDataArrays.length; i < n; i++) {
                        usePixelData[i] = HalfFloatUtils.convertToNumber(pixelDataArrays[i]);
                    }
                    texture = new Texture2D(textureWidth, textureWidth, TextureFormat.R32G32B32A32, false, false);
                    texture.setPixelsData(usePixelData, false, false);
                    texture.filterMode = FilterMode.Point;

                } else {
                    usePixelData = new Uint16Array(textureWidth * textureWidth * 4);
                    usePixelData.set(pixelDataArrays, 0);
                    texture = new Texture2D(textureWidth, textureWidth, TextureFormat.R16G16B16A16, false, false);
                    texture.setPixelsData(usePixelData, false, false);
                    texture.filterMode = FilterMode.Point;
                }
                break;
            default:
                throw "Laya3D:unknow version.";
        }

        return texture;
    }

    /**
     * @internal
     * @param imageSource 
     * @param propertyParams 
     * @param constructParams 
     * @returns 
     */
    static _parseImage(imageSource: any, propertyParams: TexturePropertyParams = null, constructParams: TextureConstructParams = null): Texture2D {

        let format = constructParams ? constructParams[2] : TextureFormat.R8G8B8A8;
        let mipmap = constructParams ? constructParams[3] : true;
        let canread = constructParams ? constructParams[4] : false;
        let srgb = constructParams ? constructParams[5] : false;
        let pma = propertyParams ? propertyParams.premultiplyAlpha : false;
        // todo  srgb
        let texture = new Texture2D(imageSource.width, imageSource.height, format, mipmap, canread, srgb, pma);

        if (propertyParams) {
            texture.setImageData(imageSource, pma, false);
            texture.setProperties(propertyParams);
        }
        else
            texture.setImageData(imageSource, false, false);

        if (canread) {
            if (LayaEnv.isConch && imageSource._nativeObj) {
                texture._pixels = new Uint8Array(imageSource._nativeObj.getImageData(0, 0, imageSource.width, imageSource.height));
            } else {
                ILaya.Browser.canvas.size(imageSource.width, imageSource.height);
                ILaya.Browser.canvas.clear();
                ILaya.Browser.context.drawImage(imageSource, 0, 0, imageSource.width, imageSource.height);
                texture._pixels = new Uint8Array(ILaya.Browser.context.getImageData(0, 0, imageSource.width, imageSource.height).data.buffer);
            }
        }

        return texture;
    }

    /**
     * @internal
     * @param data 
     * @param propertyParams 
     * @param constructParams 
     * @returns 
     */
    static _parseDDS(data: ArrayBuffer, propertyParams: TexturePropertyParams = null, constructParams: TextureConstructParams = null) {

        let ddsInfo = DDSTextureInfo.getDDSTextureInfo(data);

        let sRGB = constructParams[5];

        let texture = new Texture2D(ddsInfo.width, ddsInfo.height, ddsInfo.format, ddsInfo.mipmapCount > 1, false, sRGB);

        texture.setDDSData(ddsInfo);
        if (propertyParams)
            texture.setProperties(propertyParams);

        return texture;
    }

    /**
     * @internal
     * @param data 
     * @param propertyParams 
     * @param constructParams 
     * @returns 
     */
    static _parseKTX(data: ArrayBuffer, propertyParams: TexturePropertyParams = null, constructParams: TextureConstructParams = null) {
        let ktxInfo = KTXTextureInfo.getKTXTextureInfo(data);

        let texture = new Texture2D(ktxInfo.width, ktxInfo.height, ktxInfo.format, ktxInfo.mipmapCount > 1, false, ktxInfo.sRGB);

        texture.setKTXData(ktxInfo);
        if (propertyParams)
            texture.setProperties(propertyParams);
        return texture;
    }

    /**
     * @internal
     * @param data 
     * @param propertyParams 
     * @param constructParams 
     */
    static _parsePVR(data: ArrayBuffer, propertyParams: TexturePropertyParams = null, constructParams: TextureConstructParams = null): Texture2D {
        throw "pvr !";
    }

    /**
     * @en Loads a texture from the specified URL.
     * @param url The path to the texture file.
     * @param complete The callback function to be called after the texture is loaded.
     * @zh 从指定的 URL 加载纹理。
     * @param url 纹理文件的路径。
     * @param complete 纹理加载完成后的回调函数。
     */
    static load(url: string, complete: Handler): void {
        ILaya.loader.load(url, complete, null, ILaya.Loader.TEXTURE2D);
    }

    /**@internal */
    _canRead: boolean = false;
    /**@internal */
    _pixels: Uint8Array;

    /**
     * @en Creates an instance of Texture2D.
     * @param width The width of the texture.
     * @param height The height of the texture.
     * @param format The format of the texture.
     * @param mipmap Indicates whether to generate mipmaps for the texture.
     * @param canRead Indicates whether the texture data can be read.
     * @param sRGB Indicates whether the texture uses sRGB color space.
     * @param premultiplyAlpha Indicates whether the texture data is premultiplied by the alpha channel.
     * @zh 实例化2D纹理
     * @param width 纹理的宽度。
     * @param height 纹理的高度。
     * @param format 纹理的格式。
     * @param mipmap 是否为纹理生成mipmap。
     * @param canRead 纹理数据是否可以读取。
     * @param sRGB 纹理是否使用sRGB色彩空间。
     * @param premultiplyAlpha 纹理数据是否预乘alpha通道。
     */
    constructor(width: number, height: number, format: TextureFormat, mipmap: boolean = true, canRead: boolean, sRGB: boolean = false, premultiplyAlpha: boolean = false) {
        super(width, height, format);
        this._dimension = TextureDimension.Tex2D;
        this._gammaSpace = sRGB;
        this._canRead = canRead;
        this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, width, height, format, mipmap, sRGB, premultiplyAlpha);
        return;
    }

    /**
     * @en Sets the image data for the texture.
     * @param source The image source, can be an `HTMLImageElement`, `HTMLCanvasElement`, or `ImageBitmap`.
     * @param premultiplyAlpha Whether to premultiply the alpha.
     * @param invertY Whether to invert the Y-axis of the image.
     * @zh 设置纹理的图像数据。
     * @param source 图像源，可以是 `HTMLImageElement`、`HTMLCanvasElement` 或 `ImageBitmap`。
     * @param premultiplyAlpha 是否预乘 alpha。
     * @param invertY 是否反转图像的 Y 轴。
     */
    setImageData(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.textureContext.setTextureImageData(texture, source, premultiplyAlpha, invertY);
    }

    /**
     * @en Sets the pixel data for the texture.
     * @param source The pixel data to be set.
     * @param premultiplyAlpha Whether to premultiply the alpha.
     * @param invertY Whether to invert the Y-axis of the pixel data.
     * @zh 设置纹理的像素数据。
     * @param source 要设置的像素数据。
     * @param premultiplyAlpha 是否预乘 alpha。
     * @param invertY 是否反转像素数据的 Y 轴。
     */
    setPixelsData(source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.textureContext.setTexturePixelsData(texture, source, premultiplyAlpha, invertY);
    }

    /**
     * @en Sets a sub-region of pixel data for the texture.
     * @param xOffset The x-offset for the sub-region.
     * @param yOffset The y-offset for the sub-region.
     * @param width The width of the sub-region.
     * @param height The height of the sub-region.
     * @param pixels The pixel data for the sub-region.
     * @param mipmapLevel The mipmap level to update, if mipmap is enabled.
     * @param generateMipmap Whether to generate mipmaps for the updated region.
     * @param premultiplyAlpha Whether to premultiply the alpha channel of the pixel data.
     * @param invertY Whether to invert the Y-axis of the pixel data.
     * @zh 设置纹理的子区域像素数据。
     * @param xOffset 子区域的 x 偏移。
     * @param yOffset 子区域的 y 偏移。
     * @param width 子区域的宽度。
     * @param height 子区域的高度。
     * @param pixels 子区域的像素数据。
     * @param mipmapLevel 要更新的mipmap等级，如果mipmap为true。
     * @param generateMipmap 是否为更新的区域生成mipmap。
     * @param premultiplyAlpha 是否预乘子区域的像素数据的 alpha 通道。
     * @param invertY 是否反转子区域的像素数据的 Y 轴。
     */
    setSubPixelsData(xOffset: number, yOffset: number, width: number, height: number, pixels: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.textureContext.setTextureSubPixelsData(texture, pixels, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }

    /**
     * @en Sets the DDS  data for the texture.
     * @param ddsInfo The DDS texture information containing the data to be set.
     * @zh 设置纹理的 DDS 数据。
     * @param ddsInfo DDS 纹理信息，包含要设置的数据。
     */
    setDDSData(ddsInfo: DDSTextureInfo) {
        let texture = this._texture;
        LayaGL.textureContext.setTextureDDSData(texture, ddsInfo);
    }

    /**
     * @en Sets the KTX  data for the texture.
     * @param ktxInfo The KTX texture information containing the data to be set.
     * @zh 设置纹理的 KTX 数据。
     * @param ktxInfo KTX 纹理信息，包含要设置的数据。
     */
    setKTXData(ktxInfo: KTXTextureInfo) {
        let texture = this._texture;
        LayaGL.textureContext.setTextureKTXData(texture, ktxInfo);
    }

    /**
     * @en Sets the HDR data for the texture.
     * @param hdrInfo The HDR texture information containing the data to be set.
     * @zh 设置纹理的 HDR 数据。
     * @param hdrInfo HDR 纹理信息，包含要设置的数据。
     */
    setHDRData(hdrInfo: HDRTextureInfo) {
        let texture = this._texture;
        LayaGL.textureContext.setTextureHDRData(texture, hdrInfo);
    }

    /**
     * @en The default texture.
     * @zh 默认纹理。
     */
    get defaultTexture(): BaseTexture {
        return Texture2D.grayTexture;
    }

    /**
     * @en Retrieves the pixel data from the texture.
     * @zh 从纹理中检索像素数据。
     */
    getPixels() {
        if (this._canRead && this._pixels) {
            return this._pixels;
        }
        else {
            throw new Error("Texture2D: must set texture canRead is true.");
        }
    }

    /**
     * @internal
     * @param propertyParams 
     */
    private setProperties(propertyParams: TexturePropertyParams) {
        if (propertyParams) {
            if (propertyParams.wrapModeU != null) this.wrapModeU = propertyParams.wrapModeU;
            if (propertyParams.wrapModeV != null) this.wrapModeV = propertyParams.wrapModeV;
            if (propertyParams.filterMode != null) this.filterMode = propertyParams.filterMode;
            if (propertyParams.anisoLevel != null) this.anisoLevel = propertyParams.anisoLevel;
        }
    }
}