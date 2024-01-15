import { Texture2D } from "../../../../resource/Texture2D";
import { ILightMapData } from "../../../RenderDriverLayer/RenderModuleData/ILightMapData";

export class RTLightmapData implements ILightMapData {
    lightmapColor: Texture2D;
    lightmapDirection: Texture2D;

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTLightmap();
    }
}