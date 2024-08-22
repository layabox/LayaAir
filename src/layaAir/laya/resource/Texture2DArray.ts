import { ITextureContext } from "../RenderDriver/DriverDesign/RenderDevice/ITextureContext";
import { RenderCapable } from "../RenderEngine/RenderEnum/RenderCapable";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { LayaGL } from "../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";

/**
 * @en `Texture2DArray` represents a 2D texture array.
 * @zh `Texture2DArray` 类表示一个2D纹理数组。
 */
export class Texture2DArray extends BaseTexture {

    private static _defaultTexture: Texture2DArray;

    /**
     * @en The default texture.
     * @zh 默认纹理。
     */
    static get defaultTexture() {
        return this._defaultTexture;
    }

    /** @internal */
    static __init__() {
        if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
            this._defaultTexture = new Texture2DArray(1, 1, 1, TextureFormat.R8G8B8A8, false, false, false);
            this._defaultTexture.lock = true;

            this._defaultTexture.setPixelsData(new Uint8Array([255, 255, 255, 255]), false, false);
        }
    }
    /**
     * @en The number of texture layers.
     * @zh 纹理层的数量。
     */
    depth: number;

    constructor(width: number, height: number, depth: number, format: TextureFormat, mipmap: boolean = true, canRead: boolean, sRGB: boolean = false) {
        super(width, height, format);
        this._dimension = TextureDimension.Texture2DArray;
        this._gammaSpace = sRGB;

        this.depth = depth;

        let context = <ITextureContext>LayaGL.textureContext;

        this._texture = context.createTexture3DInternal(this._dimension, width, height, depth, format, mipmap, sRGB, false);

        return;
    }

    /**
     * @en Sets the image data for the texture.
     * @param sources The array of images to set.
     * @param premultiplyAlpha Whether to premultiply the alpha channel.
     * @param invertY Whether to invert the Y-axis of the image.
     * @zh 设置纹理的图像数据。
     * @param sources 要设置的图像数组。
     * @param premultiplyAlpha 是否预乘 alpha。
     * @param invertY 是否反转图像 Y 轴。
     */
    setImageData(sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        let context = <ITextureContext>LayaGL.textureContext;
        context.setTexture3DImageData(texture, sources, this.depth, premultiplyAlpha, invertY);
    }

    /**
     * @en Sets the pixel data for the texture.
     * @param source The pixel data to set.
     * @param premultiplyAlpha Whether to premultiply the alpha channel.
     * @param invertY Whether to invert the Y-axis of the image.
     * @zh 设置纹理的像素数据。
     * @param source 要设置的像素数据。
     * @param premultiplyAlpha 是否预乘 alpha。
     * @param invertY 是否反转图像 Y 轴。
     */
    setPixelsData(source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        let context = <ITextureContext>LayaGL.textureContext;
        context.setTexture3DPixelsData(texture, source, this.depth, premultiplyAlpha, invertY)
    }


    /**
     * @en Updates the sub-pixel data for the texture.
     * @param xOffset The x-offset.
     * @param yOffset The y-offset.
     * @param zOffset The z-offset.
     * @param width The width of the data to update.
     * @param height The height of the data to update.
     * @param depth The depth level of the data to update.
     * @param pixels The pixel data to update.
     * @param mipmapLevel The mipmap level to update.
     * @param generateMipmap Whether to generate mipmaps after the update.
     * @param premultiplyAlpha Whether to premultiply the alpha channel.
     * @param invertY Whether to invert the Y-axis of the image.
     * @zh 更新纹理的子像素数据。
     * @param xOffset x 偏移
     * @param yOffset y 偏移
     * @param zOffset z 偏移
     * @param width 要更新的数据的宽度。
     * @param height 要更新的数据的高度。
     * @param depth 要更新的数据的深度。
     * @param pixels 要更新的像素数据。
     * @param mipmapLevel 要更新的 mipmap 等级。
     * @param generateMipmap 是否在更新后生成 mipmap。
     * @param premultiplyAlpha 是否预乘 alpha。
     * @param invertY 是否反转图像 Y 轴。
     */
    setSubPixelsData(xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, pixels: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        let context = <ITextureContext>LayaGL.textureContext;
        context.setTexture3DSubPixelsData(texture, pixels, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY);
    }

}