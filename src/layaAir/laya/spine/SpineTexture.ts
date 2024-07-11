import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Texture2D } from "../resource/Texture2D";

/**
 * @ 3.8版本适配使用
 */
export class SpineTexture {

    realTexture: Texture2D;

    constructor(tex: Texture2D) {
        this.realTexture = tex;
    }

    getImage(): Object {
        return {
            width: (this.realTexture?.width) ?? 16,
            height: (this.realTexture?.height) ?? 16,
        };
    }

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

    convertWrapMode(mode: spine.TextureWrap) {
        return mode == spine.TextureWrap.ClampToEdge ? WrapMode.Clamp : (mode == spine.TextureWrap.MirroredRepeat ? WrapMode.Mirrored : WrapMode.Repeat);
    }

    setWraps(uWrap: spine.TextureWrap, vWrap: spine.TextureWrap) {
        if (!this.realTexture)
            return;

        this.realTexture.wrapModeU = this.convertWrapMode(uWrap);
        this.realTexture.wrapModeV = this.convertWrapMode(vWrap);
    }
}