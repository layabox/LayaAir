import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ILightMapData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * LayaX LightmapData bridge.
 *
 * Wraps lightmap color and direction textures for the Rust rendering pipeline
 * via `conchLayaXLightmapData`.
 */
export class LayaXLightmapData implements ILightMapData {

    /** @internal */
    _nativeObj: any;

    /** @internal */
    _lightmapColor: InternalTexture;
    /** @internal */
    _lightmapDirection: InternalTexture;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXLightmapData();
    }

    public get lightmapColor(): InternalTexture {
        return this._lightmapColor;
    }
    public set lightmapColor(value: InternalTexture) {
        this._lightmapColor = value;
        this._nativeObj.setLightmapColor(value ? (value as any)._nativeObj : null);
    }

    public get lightmapDirection(): InternalTexture {
        return this._lightmapDirection;
    }
    public set lightmapDirection(value: InternalTexture) {
        this._lightmapDirection = value;
        this._nativeObj.setLightmapDirection(value ? (value as any)._nativeObj : null);
    }

    destroy(): void {
        this._nativeObj.destroy();
    }
}
