import { Texture2D } from "../../../resource/Texture2D";

/**
 * 光照贴图。
 */
export class Lightmap {
    /** 光照贴图颜色。 */
    lightmapColor: Texture2D;
    /** 光照贴图方向。 */
    lightmapDirection: Texture2D;
}