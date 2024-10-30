import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Texture2D } from "../resource/Texture2D";

/**
 * @en Used for adaptation to version 3.8
 * @zh 用于3.8版本适配
 */
export class SpineTexture {

    /**
     * @en The actual Texture2D object
     * @zh 实际的Texture2D对象
     */
    realTexture: Texture2D;

    /**
     * @en Creates a new SpineTexture instance.
     * @param tex The Texture2D to be wrapped
     * @zh 创建SpineTexture的新实例
     * @param tex 要被包装的Texture2D
     */
    constructor(tex: Texture2D) {
        this.realTexture = tex;
    }

    /**
     * @en Get the image dimensions
     * @zh 获取图像尺寸
     */
    getImage(): Object {
        return {
            width: (this.realTexture?.width) ?? 16,
            height: (this.realTexture?.height) ?? 16,
        };
    }

    /**
     * @en Set the texture filters
     * @param minFilter The minification filter
     * @param magFilter The magnification filter
     * @zh 设置纹理过滤器
     * @param minFilter 缩小过滤器
     * @param magFilter 放大过滤器
     */
    setFilters(minFilter: spine.TextureFilter, magFilter: spine.TextureFilter) {
        if (!this.realTexture)
            return;

        let filterMode: number;
        if (magFilter === window.spine.TextureFilter.Nearest)
            filterMode = FilterMode.Point;
        else
            filterMode = FilterMode.Bilinear;

        this.realTexture.filterMode = filterMode;
    }

    /**
     * @en Convert Spine texture wrap mode to LayaAir wrap mode
     * @param mode The Spine texture wrap mode
     * @zh 将Spine纹理包裹模式转换为LayaAir包裹模式
     * @param mode Spine纹理包裹模式
     */
    convertWrapMode(mode: spine.TextureWrap) {
        return mode == window.spine.TextureWrap.ClampToEdge ? WrapMode.Clamp : (mode == window.spine.TextureWrap.MirroredRepeat ? WrapMode.Mirrored : WrapMode.Repeat);
    }

    /**
     * @en Set the texture wrap modes
     * @param uWrap The horizontal wrap mode
     * @param vWrap The vertical wrap mode
     * @zh 设置纹理包裹模式
     * @param uWrap 水平包裹模式
     * @param vWrap 垂直包裹模式
     */
    setWraps(uWrap: spine.TextureWrap, vWrap: spine.TextureWrap) {
        if (!this.realTexture)
            return;

        this.realTexture.wrapModeU = this.convertWrapMode(uWrap);
        this.realTexture.wrapModeV = this.convertWrapMode(vWrap);
    }
}