import { RenderCapable } from "../RenderEngine/RenderEnum/RenderCapable";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { ITexture3DContext } from "../RenderEngine/RenderInterface/ITextureContext";
import { LayaGL } from "../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";

/**
 * 3D 纹理
 */
export class Texture3D extends BaseTexture {

    private static _defaultTexture: Texture3D;

    static get defaultTexture() {
        return this._defaultTexture;
    }

    /** @internal */
    static __init__() {
        if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
            this._defaultTexture = new Texture3D(1, 1, 1, TextureFormat.R8G8B8A8, false, false);
            this._defaultTexture.lock = true;

            this._defaultTexture.setPixelsData(new Uint8Array([255, 255, 255, 255]));
        }
    }

    depth: number;

    constructor(width: number, height: number, depth: number, format: TextureFormat, mipmap: boolean = true, sRGB: boolean = false) {
        super(width, height, format);
        this._dimension = TextureDimension.Tex3D;
        this.depth = depth;

        this._gammaSpace = sRGB;

        let context = <ITexture3DContext>LayaGL.textureContext;

        this._texture = context.createTexture3DInternal(this._dimension, width, height, depth, format, mipmap, sRGB, false);
    }

    /**
    * 设置像素数据
    * @param source 像素数据
    */
    setPixelsData(source: ArrayBufferView) {
        let texture = this._texture;
        let context = <ITexture3DContext>LayaGL.textureContext;
        context.setTexture3DPixelsData(texture, source, this.depth, false, false)
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
     */
    setSubPixelsData(xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, pixels: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean) {
        let texture = this._texture;
        let context = <ITexture3DContext>LayaGL.textureContext;
        context.setTexture3DSubPixelsData(texture, pixels, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, false, false);
    }

}