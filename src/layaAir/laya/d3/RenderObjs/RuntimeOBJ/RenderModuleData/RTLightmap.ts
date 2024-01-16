import { InternalTexture } from "../../../../RenderEngine/RenderInterface/InternalTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { ILightMapData } from "../../../RenderDriverLayer/RenderModuleData/ILightMapData";

export class RTLightmapData implements ILightMapData {
    lightmapColor: InternalTexture;
    lightmapDirection: InternalTexture;

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTLightmap();
    }
    
    destroy(): void {
        throw new Error("Method not implemented.");
    }
}