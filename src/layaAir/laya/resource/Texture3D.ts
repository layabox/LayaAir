import { RenderCapable } from "../RenderEngine/RenderEnum/RenderCapable";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { LayaGL } from "../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";

/**
 * @en The Texture3D class is used to generate 3D textures.
 * @zh Texture3D 类用于生成 3D 纹理。
 */
export class Texture3D extends BaseTexture {

    private static _defaultTexture: Texture3D;

    /**
     * @en The default texture for 3D textures.
     * @zh 3D纹理的默认纹理。
     */
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

    /**
     * @en The depth of the 3D texture.
     * @zh 3D纹理的深度。
     */
    depth: number;

    /**
     * @en Creates an instance of Texture3D.
     * @param width The width of the texture.
     * @param height The height of the texture.
     * @param depth The depth of the texture.
     * @param format The format of the texture.
     * @param mipmap Indicates whether to generate mipmaps for the texture.
     * @param sRGB Indicates whether the texture uses sRGB color space.
     * @zh 创建一个 Texture3D 的实例。
     * @param width 纹理的宽度。
     * @param height 纹理的高度。
     * @param depth 纹理的深度。
     * @param format 纹理的格式。
     * @param mipmap 是否为纹理生成 mipmap。
     * @param sRGB 纹理是否使用 sRGB 色彩空间。
     */
    constructor(width: number, height: number, depth: number, format: TextureFormat, mipmap: boolean = true, sRGB: boolean = false) {
        super(width, height, format);
        this._dimension = TextureDimension.Tex3D;
        this.depth = depth;

        this._gammaSpace = sRGB;

        let context = LayaGL.textureContext;

        this._texture = context.createTexture3DInternal(this._dimension, width, height, depth, format, mipmap, sRGB, false);
    }

    /**
     * @en Sets the pixel data for the 3D texture.
     * @param source The source pixel data to set.
     * @zh 设置3D纹理的像素数据。
     * @param source 要设置的源像素数据。
     */
    setPixelsData(source: ArrayBufferView) {
        let texture = this._texture;
        let context = LayaGL.textureContext;
        context.setTexture3DPixelsData(texture, source, this.depth, false, false)
    }

    /**
     * @en Update pixel data of 3D texture in sub regions
     * @param xOffset The x-offset within the texture.
     * @param yOffset The y-offset within the texture.
     * @param zOffset The z-offset within the texture.
     * @param width The width of the sub-region to update.
     * @param height The height of the sub-region to update.
     * @param depth The depth of the sub-region to update.
     * @param pixels The pixel data to update.
     * @param mipmapLevel The mipmap level to update.
     * @param generateMipmap Whether to generate mipmaps after the update.
     * @zh 更新子区域3D纹理的像素数据。
     * @param xOffset 纹理内的 x 偏移。
     * @param yOffset 纹理内的 y 偏移。
     * @param zOffset 纹理内的 z 偏移。
     * @param width 要更新的子区域的宽度。
     * @param height 要更新的子区域的高度。
     * @param depth 要更新的子区域的深度。
     * @param pixels 要更新的像素数据。
     * @param mipmapLevel 要更新的 mipmap 等级。
     * @param generateMipmap 是否在更新后生成 mipmap。
     */
    setSubPixelsData(xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, pixels: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean) {
        let texture = this._texture;
        let context = LayaGL.textureContext;
        context.setTexture3DSubPixelsData(texture, pixels, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, false, false);
    }

}