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

    dimension: TextureDimension;

    width: number;

    height: number;

    anisoLevel: number;

    mipmap: boolean;

    mipmapCount: number;

    premultiplyAlpha: boolean;

    invertY: boolean;

    useSRGBLoad: boolean;

    gammaCorrection: number;

    // warp mode
    warpModeU: WarpMode;

    warpModeV: WarpMode;

    warpModeW: WarpMode;

    // filter mode
    filterMode: FilterMode;

    // todo
    compareMode: number;

    // todo
    compareFunc: number;

    _setSampler(): void;

    generateMipmap(): boolean;

    dispose(): void;
}