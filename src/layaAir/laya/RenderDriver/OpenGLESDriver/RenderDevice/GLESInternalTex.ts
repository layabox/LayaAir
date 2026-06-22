import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";

/**
 * JS-read mirror slot layout (20 slots / 80 bytes); shared contract with C++ GLESInternalTex.
 * C++ members are the source of truth; C++ writes the block at bind time and on
 * setGpuMemory / dispose / sampler rt_ setters. compareMode is the only JS-direct-write slot.
 */
const enum TexSlot {
    Width = 0,            // u32
    Height = 1,           // u32
    MipmapCount = 2,      // u32
    Mipmap = 3,           // i32 0/1
    UseSRGBLoad = 4,      // i32 0/1
    IsPotSize = 5,        // i32 0/1
    GpuMemory = 6,        // u32
    GammaCorrection = 7,  // f32
    CompareMode = 8,      // i32 (JS direct write)
    Depth = 9,            // u32
    FilterMode = 10,      // i32
    WrapU = 11,           // i32
    WrapV = 12,           // i32
    WrapW = 13,           // i32
    AnisoLevel = 14,      // f32
    BaseMipmapLevel = 15, // i32
    MaxMipmapLevel = 16,  // i32
    Count = 20,
}

/** @internal */
export class GLESInternalTex implements InternalTexture {
    _nativeObj: any;

    // JS-read mirror block; see TexSlot for the C++/TS shared layout.
    private _propsF32: Float32Array;
    private _propsI32: Int32Array;
    private _propsU32: Uint32Array;

    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
        const buf = new ArrayBuffer(TexSlot.Count * 4);
        this._propsF32 = new Float32Array(buf);
        this._propsI32 = new Int32Array(buf);
        this._propsU32 = new Uint32Array(buf);
        nativeObj.bindPropertyBuffer(buf);
    }
    public get wrapU(): WrapMode {
        return this._propsI32[TexSlot.WrapU];
    }
    public set wrapU(value: WrapMode) {
        this._nativeObj.rt_setWrapU(value);
    }
    public get wrapV(): WrapMode {
        return this._propsI32[TexSlot.WrapV];
    }
    public set wrapV(value: WrapMode) {
        this._nativeObj.rt_setWrapV(value);
    }
    public get wrapW(): WrapMode {
        return this._propsI32[TexSlot.WrapW];
    }
    public set wrapW(value: WrapMode) {
        this._nativeObj.rt_setWrapW(value);
    }
    public set baseMipmapLevel(value: number) {
        this._nativeObj.rt_setBaseMipmapLevel(value);
    }
    public get baseMipmapLevel() {
        return this._propsI32[TexSlot.BaseMipmapLevel];
    }
    public set maxMipmapLevel(value: number) {
        this._nativeObj.rt_setMaxMipmapLevel(value);
    }
    public get maxMipmapLevel() {
        return this._propsI32[TexSlot.MaxMipmapLevel];
    }
    public get compareMode(): TextureCompareMode {
        return this._propsI32[TexSlot.CompareMode];
    }
    public set compareMode(value: TextureCompareMode) {
        this._propsI32[TexSlot.CompareMode] = value;
    }
    public get anisoLevel(): number {
        return this._propsF32[TexSlot.AnisoLevel];
    }
    public set anisoLevel(value: number) {
        this._nativeObj.rt_setAnisoLevel(value);
    }
    public get filterMode(): FilterMode {
        return this._propsI32[TexSlot.FilterMode];
    }
    public set filterMode(value: FilterMode) {
        this._nativeObj.rt_setFilterMode(value);
    }
    public get mipmapCount(): number {
        return this._propsU32[TexSlot.MipmapCount];
    }
    get mipmap(): boolean {
        return this._propsI32[TexSlot.Mipmap] !== 0;
    }
    public get isPotSize(): boolean {
        return this._propsI32[TexSlot.IsPotSize] !== 0;
    }
    public get useSRGBLoad(): boolean {
        return this._propsI32[TexSlot.UseSRGBLoad] !== 0;
    }
    public get depth(): number {
        return this._propsU32[TexSlot.Depth];
    }

    public get gammaCorrection(): number {
        return this._propsF32[TexSlot.GammaCorrection];
    }

    public set gammaCorrection(value: number) {
        this._nativeObj.rt_setGammaCorrection(value);
    }

    public get resource(): any {
        return this._nativeObj;
    }
    public get width(): number {
        return this._propsU32[TexSlot.Width];
    }
    public get height(): number {
        return this._propsU32[TexSlot.Height];
    }
    public get gpuMemory(): number {
        return this._propsU32[TexSlot.GpuMemory];
    }

    dispose(): void {
        this._nativeObj.dispose();
    }
}
