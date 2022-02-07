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
    warpU: WarpMode;
    warpV: WarpMode;
    warpW: WarpMode;
    anisoLevel: number;

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