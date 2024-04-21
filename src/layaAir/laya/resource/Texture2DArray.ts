import { ITextureContext } from "../RenderDriver/DriverDesign/RenderDevice/ITextureContext";
import { RenderCapable } from "../RenderEngine/RenderEnum/RenderCapable";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { LayaGL } from "../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";

/**
 * 2D 纹理 数组
 */
export class Texture2DArray extends BaseTexture {

    private static _defaultTexture: Texture2DArray;

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
     * 纹理层数
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
     * 设置Image数据
     * @param sources Image 数组
     * @param premultiplyAlpha 是否预乘 alpha
     * @param invertY 是否反转图像 Y 轴
     */
    setImageData(sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        let context = <ITextureContext>LayaGL.textureContext;
        context.setTexture3DImageData(texture, sources, this.depth, premultiplyAlpha, invertY);
    }

    /**
     * 设置像素数据
     * @param source 像素数据
     * @param premultiplyAlpha 是否预乘 alpha
     * @param invertY 是否反转图像 Y 轴
     */
    setPixelsData(source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        let context = <ITextureContext>LayaGL.textureContext;
        context.setTexture3DPixelsData(texture, source, this.depth, premultiplyAlpha, invertY)
    }

    /**
     * 更新像素数据
     * @param xOffset x 偏移
     * @param yOffset y 偏移
     * @param zOffset z 偏移
     * @param width 更新数据宽度
     * @param height 更新数据高度
     * @param depth 更新数据深度层级
     * @param pixels 像素数据
     * @param mipmapLevel mipmap 等级
     * @param generateMipmap 是否生成 mipmap
     * @param premultiplyAlpha 是否预乘 alpha
     * @param invertY 是否反转 Y 轴
     */
    setSubPixelsData(xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, pixels: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        let context = <ITextureContext>LayaGL.textureContext;
        context.setTexture3DSubPixelsData(texture, pixels, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY);
    }

}