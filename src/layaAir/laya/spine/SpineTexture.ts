import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";

export class SpineTexture {
    realTexture: Texture;

    constructor(tex: Texture) {
        this.realTexture = tex;
    }

    getImage(): Object {
        return {
            width: (this.realTexture?.sourceWidth) ?? 16,
            height: (this.realTexture?.sourceHeight) ?? 16,
        };
    }

    setFilters(minFilter: spine.TextureFilter, magFilter: spine.TextureFilter) {
        if (!this.realTexture)
            return;

        let filterMode: number;
        if (magFilter === spine.TextureFilter.Nearest)
            filterMode = FilterMode.Point;
        else
            filterMode = FilterMode.Bilinear;
        (<Texture2D>this.realTexture.bitmap).filterMode = filterMode;
    }

    convertWrapMode(mode: spine.TextureWrap) {
        return mode == spine.TextureWrap.ClampToEdge ? WrapMode.Clamp : (mode == spine.TextureWrap.MirroredRepeat ? WrapMode.Mirrored : WrapMode.Repeat);
    }

    setWraps(uWrap: spine.TextureWrap, vWrap: spine.TextureWrap) {
        if (!this.realTexture)
            return;

        let tex2D = <Texture2D>this.realTexture.bitmap;
        tex2D.wrapModeU = this.convertWrapMode(uWrap);
        tex2D.wrapModeV = this.convertWrapMode(vWrap);
    }
}