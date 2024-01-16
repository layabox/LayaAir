import { InternalTexture } from "../../../RenderEngine/RenderInterface/InternalTexture";
import { Texture2D } from "../../../resource/Texture2D";

export interface ILightMapData {
    /**@internal */
    lightmapColor: InternalTexture;
    /**@internal */
    lightmapDirection: InternalTexture;
    /**@internal */
    destroy(): void;
}