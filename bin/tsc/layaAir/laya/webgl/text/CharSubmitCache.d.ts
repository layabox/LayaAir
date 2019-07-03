import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
/**
 * ...
 * @author laoxie
 */
export declare class CharSubmitCache {
    private static __posPool;
    private static __nPosPool;
    private _data;
    private _ndata;
    private _tex;
    private _imgId;
    private _clipid;
    private _clipMatrix;
    constructor();
    clear(): void;
    destroy(): void;
    add(ctx: Context, tex: Texture, imgid: number, pos: any[], uv: ArrayLike<number>, color: number): void;
    getPos(): any[];
    enable(value: boolean, ctx: Context): void;
    submit(ctx: Context): void;
}
