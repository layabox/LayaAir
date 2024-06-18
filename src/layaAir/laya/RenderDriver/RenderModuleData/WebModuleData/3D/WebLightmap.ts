import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ILightMapData } from "../../Design/3D/I3DRenderModuleData";

export class WebLightmap implements ILightMapData {
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