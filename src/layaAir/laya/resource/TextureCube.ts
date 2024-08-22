import { DDSTextureInfo } from "../RenderEngine/DDSTextureInfo";
import { KTXTextureInfo } from "../RenderEngine/KTXTextureInfo";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { LayaGL } from "../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";
/**
 * @en Enum for the map faces of a cube texture.
 * @zh 表示立方体纹理各个面面的枚举。
 */
export enum TextureCubeFace {
    /**
     * @en The positive X face of the cube map.
     * @zh 立方体贴图的正X面。
     */
    PositiveX,
    /**
     * @en The negative X face of the cube map.
     * @zh 立方体贴图的负X面。
     */
    NegativeX,
    /**
     * @en The positive Y face of the cube map.
     * @zh 立方体贴图的正Y面。
     */
    PositiveY,
    /**
     * @en The negative Y face of the cube map.
     * @zh 立方体贴图的负Y面。
     */
    NegativeY,
    /**
     * @en The positive Z face of the cube map.
     * @zh 立方体贴图的正Z面。
     */
    PositiveZ,
    /**
     * @en The negative Z face of the cube map.
     * @zh 立方体贴图的负Z面。
     */
    NegativeZ
}

const DEFAULT_PIXELS: Uint8Array = new Uint8Array(4);

/**
 * @en TextureCube class used to generate cube texture.
 * @zh TextureCube 类用于生成立方体纹理。
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
     * @en The black solid color texture.
     * @zh 黑色纯色纹理。
     */
    static get blackTexture() {
        return TextureCube._blackTexture;
    }

    /**
     * @en The gray solid color texture.
     * @zh 灰色纯色纹理。
     */
    static get grayTexture() {
        return TextureCube._grayTexture;
    }

    /**
     * @en The white solid color texture.
     * @zh 白色纯色纹理。
     */
    static get whiteTexture() {
        return TextureCube._whiteTexture;
    }

    /**
     * @en The error texture used for cube textures.
     * @zh 立方体贴图的错误纹理。
     */
    static get errorTexture() {
        return TextureCube._errorTexture;
    }

    /**
     * @internal
     */
    static __init__(): void {
        var blackTexture: TextureCube = new TextureCube(1, TextureFormat.R8G8B8A8, false);
        var grayTexture: TextureCube = new TextureCube(1, TextureFormat.R8G8B8A8, false);
        var writeTexture: TextureCube = new TextureCube(1, TextureFormat.R8G8B8A8, false);
        var pixels = DEFAULT_PIXELS;
        pixels[0] = 0, pixels[1] = 0, pixels[2] = 0; pixels[3] = 255;
        blackTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
        blackTexture.lock = true;//锁住资源防止被资源管理释放
        pixels[0] = 128, pixels[1] = 128, pixels[2] = 128; pixels[3] = 255;
        grayTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
        grayTexture.lock = true;//锁住资源防止被资源管理释放
        pixels[0] = 255, pixels[1] = 255, pixels[2] = 255; pixels[3] = 255;
        writeTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
        writeTexture.lock = true;
        TextureCube._grayTexture = grayTexture;
        TextureCube._blackTexture = blackTexture;
        TextureCube._whiteTexture = writeTexture;
        TextureCube._errorTexture = writeTexture;
    }

    /**
     * @en Creates an instance of TextureCube.
     * @param size The size of each face of the cube texture.
     * @param format The texture format.
     * @param mipmap Indicates whether to generate mipmaps for the cube texture.
     * @param sRGB Indicates whether the texture uses sRGB color space.
     * @param premultiplyAlpha Indicates whether the texture data is premultiplied by the alpha channel.
     * @zh 创建一个TextureCube实例。
     * @param size 立方体纹理各个面大小。
     * @param format 纹理格式。
     * @param mipmap 是否为立方体纹理生成mipmap。
     * @param sRGB 是否使用sRGB色彩空间。
     * @param premultiplyAlpha 是否预乘Alpha。
     */
    constructor(size: number, format: TextureFormat, mipmap: boolean = true, sRGB: boolean = false, premultiplyAlpha: boolean = false) {
        super(size, size, format);

        this._dimension = TextureDimension.Cube;

        this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, size, size, format, mipmap, sRGB, premultiplyAlpha);
        return;
    }

    /**
     * @en Sets the image data for each face of the cube texture.
     * @param source An array of image elements, one for each face of the cube.
     * @param premultiplyAlpha Whether to premultiply the alpha channel of the image data.
     * @param invertY Whether to invert the Y-axis of the image data.
     * @zh 为立方体贴图的每个面设置图像数据。
     * @param source 图像元素数组，每个面一个。
     * @param premultiplyAlpha 是否预乘Alpha通道。
     * @param invertY 是否翻转Y轴。
     */
    setImageData(source: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean) {
        // todo source数组 改为 CubeInfo 结构体?
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

    /**
     * @en Sets the pixel data for each face of the cube texture.
     * @param source An array of pixel data, one for each face of the cube.
     * @param premultiplyAlpha Whether to premultiply the alpha.
     * @param invertY Whether to invert the Y-axis of the pixel data.
     * @zh 为立方体贴图的每个面设置像素数据。
     * @param source 像素数据数组，每个面一个。
     * @param premultiplyAlpha 是否预乘Alpha。
     * @param invertY 是否翻转Y轴。
     */
    setPixelsData(source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.textureContext.setCubePixelsData(texture, source, premultiplyAlpha, invertY);
    }

    /**
     * @en Updates sub-pixel data for the cube texture faces.
     * @param source An array of pixel data for each face of the cube texture.
     * @param xOffset The x-offset for the sub-pixel data.
     * @param yOffset The y-offset for the sub-pixel data.
     * @param width The width of the sub-region to update.
     * @param height The height of the sub-region to update.
     * @param mipmapLevel The mipmap level to update.
     * @param generateMipmap Whether to generate mipmaps after the update.
     * @param premultiplyAlpha Whether to premultiply the alpha.
     * @param invertY Whether to invert the Y-axis of the pixel data.
     * @zh 更新立方体贴图的子像素数据。
     * @param source 像素数据数组，每个面一个。
     * @param xOffset 子像素数据x偏移。
     * @param yOffset 子像素数据y偏移。
     * @param width 子像素数据宽度。
     * @param height 子像素数据高度。
     * @param mipmapLevel 子像素数据mipmap等级。
     * @param generateMipmap 是否生成mipmap。
     * @param premultiplyAlpha 是否预乘Alpha。
     * @param invertY 是否翻转Y轴。 
     */
    updateSubPixelsData(source: ArrayBufferView[], xOffset: number, yOffset: number, width: number, height: number, mipmapLevel: number, generateMipmap: boolean, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        LayaGL.textureContext.setCubeSubPixelData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }

    /**
     * @en Sets the DDS data for the cube texture.
     * @param ddsInfo The DDS texture information containing the data to be set.
     * @zh 设置立方体贴图的 DDS 数据。
     * @param ddsInfo DDS纹理信息，包含要设置的数据。
     */
    setDDSData(ddsInfo: DDSTextureInfo) {
        let texture = this._texture;
        LayaGL.textureContext.setCubeDDSData(texture, ddsInfo);
    }

    /**
     * @en Sets the KTX data for the cube texture.
     * @param ktxInfo The KTX texture information containing the data to be set.
     * @zh 设置立方体贴图的 KTX 数据。
     * @param ktxInfo KTX纹理信息，包含要设置的数据。
     */
    setKTXData(ktxInfo: KTXTextureInfo) {
        let texture = this._texture;
        LayaGL.textureContext.setCubeKTXData(texture, ktxInfo);
    }

    /**
     * @en The default texture for cube textures.
     * @zh 立方体贴图的默认纹理。
     */
    get defaultTexture(): BaseTexture {
        return TextureCube.grayTexture;
    }
}