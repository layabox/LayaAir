import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";

/** @internal */
export class GLESInternalTex implements InternalTexture {
    _nativeObj: any;
    //constructor(target: number, width: number, height: number, depth: number, dimension: TextureDimension, mipmap: boolean, useSRGBLoader: boolean, gammaCorrection: number) {
    //{
    //     this._nativeObj = new (window as any).conchGLESInternalTex(target, width, height, depth, dimension, mipmap, useSRGBLoader, gammaCorrection);
    //}
    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
    }
    public get wrapU(): WrapMode {
        return this._nativeObj.warpU;
    }
    public set wrapU(value: WrapMode) {
        this._nativeObj.warpU = value;
    }
    public get wrapV(): WrapMode {
        return this._nativeObj.warpV;
    }
    public set wrapV(value: WrapMode) {
        this._nativeObj.warpV = value;
    }
    public get wrapW(): WrapMode {
        return this._nativeObj.warpW;
    }
    public set wrapW(value: WrapMode) {
        this._nativeObj.wrapW = value;
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
    }
    public get anisoLevel(): number {
        return this._nativeObj.anisoLevel;
    }
    public set anisoLevel(value: number) {
        this._nativeObj.anisoLevel = value;
    }
    public get filterMode(): FilterMode {
        return this._nativeObj.filterMode;
    }
    public set filterMode(value: FilterMode) {
        this._nativeObj.filterMode = value;
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
    public get resource(): any {
        return null;
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
        this._nativeObj = null;
    }
}