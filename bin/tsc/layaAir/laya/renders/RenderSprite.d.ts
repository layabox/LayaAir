import { Context } from "../resource/Context";
import { RenderTexture2D } from "../resource/RenderTexture2D";
/**
 * @private
 * 精灵渲染器
 */
export declare class RenderSprite {
    /** @private */
    static renders: any[];
    /** @private */
    protected static NORENDER: RenderSprite;
    private static _initRenderFun;
    private static _getTypeRender;
    constructor(type: number, next: RenderSprite);
    protected onCreate(type: number): void;
    static tempUV: any[];
    static tmpTarget(ctx: Context, rt: RenderTexture2D, w: number, h: number): void;
    static recycleTarget(rt: RenderTexture2D): void;
    static setBlendMode(blendMode: string): void;
}
