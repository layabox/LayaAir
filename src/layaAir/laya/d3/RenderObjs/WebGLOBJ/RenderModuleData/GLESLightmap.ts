import { InternalTexture } from "../../../../RenderEngine/RenderInterface/InternalTexture";
import { ILightMapData } from "../../../RenderDriverLayer/RenderModuleData/ILightMapData";

export class GLESLightmap implements ILightMapData {
    /**@internal */
    lightmapColor: InternalTexture;
    /**@internal */
    lightmapDirection: InternalTexture;
    /**@internal */
    destroy(): void {
        this.lightmapColor = null;
        this.lightmapDirection = null;
    }
}