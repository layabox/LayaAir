import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";

/** @internal */
export class GLESInternalTex implements InternalTexture {
    resource: any;
    target: number;
    width: number;
    height: number;
    depth: number;
    isPotSize: boolean;
    mipmap: boolean;
    mipmapCount: number;
    filterMode: FilterMode;
    wrapU: WrapMode;
    wrapV: WrapMode;
    wrapW: WrapMode;
    anisoLevel: number;
    baseMipmapLevel: number;
    maxMipmapLevel: number;
    compareMode: TextureCompareMode;
    gpuMemory: number;
    useSRGBLoad: boolean;
    gammaCorrection: number;
    dispose(): void {
        throw new Error("Method not implemented.");
    }

  
}