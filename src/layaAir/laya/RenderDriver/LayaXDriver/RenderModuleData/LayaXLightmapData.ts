import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ILightMapData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * TS-owned lightmap-data buffer layout. Contract shared with C++ `LayaXLightmapData_JS`
 * (and future Rust direct-read) — changing it requires updating both sides.
 */
const enum LMSlot {
    OffsetX = 0,       // f32 xyzw
    LightmapIndex = 4, // i32
    Count = 5,
}

/**
 * LayaX LightmapData bridge.
 *
 * Wraps lightmap color and direction textures for the Rust rendering pipeline
 * via `conchLayaXLightmapData`. offset xyzw + lightmapIndex live in a TS-owned
 * ArrayBuffer that C++ holds (pointer reserved for future Rust direct-read).
 */
export class LayaXLightmapData implements ILightMapData {

    /** @internal */
    _nativeObj: any;

    /** @internal */
    _lightmapColor: InternalTexture;
    /** @internal */
    _lightmapDirection: InternalTexture;

    // TS owns this buffer; C++ caches its pointer via bindBuffer. Held as an instance
    // field so it stays alive (GC). No consumer yet — forward path for native/Rust.
    private _buf: ArrayBuffer;
    private _f32: Float32Array;
    private _i32: Int32Array;

    public get offsetX(): number { return this._f32[LMSlot.OffsetX]; }
    public set offsetX(value: number) { this._f32[LMSlot.OffsetX] = value; }
    public get offsetY(): number { return this._f32[LMSlot.OffsetX + 1]; }
    public set offsetY(value: number) { this._f32[LMSlot.OffsetX + 1] = value; }
    public get offsetZ(): number { return this._f32[LMSlot.OffsetX + 2]; }
    public set offsetZ(value: number) { this._f32[LMSlot.OffsetX + 2] = value; }
    public get offsetW(): number { return this._f32[LMSlot.OffsetX + 3]; }
    public set offsetW(value: number) { this._f32[LMSlot.OffsetX + 3] = value; }
    public get lightmapIndex(): number { return this._i32[LMSlot.LightmapIndex]; }
    public set lightmapIndex(value: number) { this._i32[LMSlot.LightmapIndex] = value; }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXLightmapData();
        this._buf = new ArrayBuffer(LMSlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._i32 = new Int32Array(this._buf);
        this._i32[LMSlot.LightmapIndex] = -1; // C++ default
        this._nativeObj.bindBuffer(this._buf);
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
