import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";

/** @internal */
export class LayaXInternalTex implements InternalTexture {
    _nativeObj: any;

    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
    }

    public get wrapU(): WrapMode {
        return this._nativeObj.wrapU;
    }
    public set wrapU(value: WrapMode) {
        this._nativeObj.wrapU = value;
        this._nativeObj.syncSamplerParams?.();
    }

    public get wrapV(): WrapMode {
        return this._nativeObj.wrapV;
    }
    public set wrapV(value: WrapMode) {
        this._nativeObj.wrapV = value;
        this._nativeObj.syncSamplerParams?.();
    }

    public get wrapW(): WrapMode {
        return this._nativeObj.wrapW;
    }
    public set wrapW(value: WrapMode) {
        this._nativeObj.wrapW = value;
        this._nativeObj.syncSamplerParams?.();
    }

    public set baseMipmapLevel(value: number) {
        this._nativeObj.baseMipmapLevel = value;
    }
    public get baseMipmapLevel() {
        return this._nativeObj.baseMipmapLevel;
    }

    public set maxMipmapLevel(value: number) {
        this._nativeObj.maxMipmapLevel = value;
    }
    public get maxMipmapLevel() {
        return this._nativeObj.maxMipmapLevel;
    }

    public get compareMode(): TextureCompareMode {
        return this._nativeObj.compareMode;
    }
    public set compareMode(value: TextureCompareMode) {
        this._nativeObj.compareMode = value;
        this._nativeObj.syncSamplerParams?.();
    }

    public get anisoLevel(): number {
        return this._nativeObj.anisoLevel;
    }
    public set anisoLevel(value: number) {
        this._nativeObj.anisoLevel = value;
        this._nativeObj.syncSamplerParams?.();
    }

    public get filterMode(): FilterMode {
        return this._nativeObj.filterMode;
    }
    public set filterMode(value: FilterMode) {
        this._nativeObj.filterMode = value;
        this._nativeObj.syncSamplerParams?.();
    }

    public get mipmapCount(): number {
        return this._nativeObj.mipmapCount;
    }

    get mipmap(): boolean {
        return this._nativeObj.mipmap;
    }

    public get isPotSize(): boolean {
        return this._nativeObj.getIsPotSize();
    }

    public get useSRGBLoad(): boolean {
        return this._nativeObj.useSRGBLoad;
    }

    public get depth(): number {
        return this._nativeObj.getDepth();
    }

    public get gammaCorrection(): number {
        return this._nativeObj.gammaCorrection;
    }

    public set gammaCorrection(value: number) {
        this._nativeObj.gammaCorrection = value;
    }

    public get resource(): any {
        return this._nativeObj;
    }

    public get width(): number {
        return this._nativeObj.getWidth();
    }

    public get height(): number {
        return this._nativeObj.getHeight();
    }

    public get gpuMemory(): number {
        return this._nativeObj.getGPUMemory();
    }

    dispose(): void {
        this._nativeObj.dispose();
    }
}
