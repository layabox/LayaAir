import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ILightMapData } from "../../Design/3D/I3DRenderModuleData";

export class RTLightmapData implements ILightMapData {
     /**@internal */
     _lightmapColor: InternalTexture;
     /**@internal */
     _lightmapDirection: InternalTexture;
    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTLightmapData();
    }
    public get lightmapColor(): InternalTexture {
        return this._lightmapColor;
    }
    public set lightmapColor(value: InternalTexture) {
        this._lightmapColor = value;
        this._nativeObj.setLightmapColor(value);
    }
    public get lightmapDirection(): InternalTexture {
        return this._lightmapDirection;
    }
    public set lightmapDirection(value: InternalTexture) {
        this._lightmapDirection = value;
        this._nativeObj.setLightmapDirection(value);
    }
    destroy(): void {
        this._nativeObj.destroy();
    }
}