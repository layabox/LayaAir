import { LayaGL } from "../layagl/LayaGL";
import { GL2TextureContext } from "../RenderEngine/RenderEngine/WebGLEngine/GL2TextureContext";
import { WebGLInternalTex } from "../RenderEngine/RenderEngine/WebGLEngine/WebGLInternalTex";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { BaseTexture } from "./BaseTexture";

/**
 * 2D 纹理 数组
 */
export class Texture2DArray extends BaseTexture {

    readonly depth: number;

    constructor(width: number, height: number, depth: number, format: TextureFormat, mipmap: boolean = true, canRead: boolean, sRGB: boolean = false) {
        super(width, height, format);
        this._dimension = TextureDimension.Texture2DArray;
        this._gammaSpace = sRGB;

        this.depth = depth;

        this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, width, height, format, mipmap, sRGB);

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
        let context = <GL2TextureContext>LayaGL.textureContext;

        context.setTexture3DImageData(<WebGLInternalTex>texture, sources, this.depth, premultiplyAlpha, invertY);
    }

    /**
     * 设置像素数据
     * @param source 像素数据
     * @param premultiplyAlpha 是否预乘 alpha
     * @param invertY 是否反转图像 Y 轴
     */
    setPixlesData(source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        let texture = this._texture;
        let context = <GL2TextureContext>LayaGL.textureContext;
        context.setTexture3DPixlesData(<WebGLInternalTex>texture, source, this.depth, premultiplyAlpha, invertY)
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
        let context = <GL2TextureContext>LayaGL.textureContext;
        context.setTexture3DSubPixelsData(<WebGLInternalTex>texture, pixels, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY);
    }

}