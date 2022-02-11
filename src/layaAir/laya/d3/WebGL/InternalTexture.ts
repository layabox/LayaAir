import { CompareMode } from "../../resource/CompareMode";
import { FilterMode } from "../../resource/FilterMode";
import { WarpMode } from "../../resource/WrapMode";


export enum TextureDimension {
    Tex2D,
    Cube,
    Tex3D,
    Texture2DArray,
    CubeArray,
    Unkonw,
    None
}

/**
 * @internal 
 * 内部纹理对象
 */
export interface InternalTexture {

    /**
     * gpu texture object
     */
    resource: any;

    width: number;
    height: number;
    isPotSize: boolean;

    mipmap: boolean;
    mipmapCount: number;

    filterMode: FilterMode;
    wrapU: WarpMode;
    wrapV: WarpMode;
    wrapW: WarpMode;
    anisoLevel: number;

    compareMode: CompareMode;

    /**
     * 是否使用 sRGB格式 加载图片数据
     */
    useSRGBLoad: boolean;
    /**
     * gamma 矫正值
     */
    gammaCorrection: number;

    dispose(): void;
}