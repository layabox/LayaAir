import { Sprite } from "../display/Sprite";
import { Context } from "../resource/Context";
import { RenderTexture2D } from "../resource/RenderTexture2D";
/**
 * @private
 * 精灵渲染器
 */
export declare class RenderSprite {
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    /** @private */
    static INIT: number;
    /** @private */
    static renders: any[];
    /** @private */
    protected static NORENDER: RenderSprite;
    /** @private */
    _next: RenderSprite;
    /** @private */
    _fun: Function;
    static __init__(): void;
    private static _initRenderFun;
    private static _getTypeRender;
    constructor(type: number, next: RenderSprite);
    protected onCreate(type: number): void;
    _style(sprite: Sprite, context: Context, x: number, y: number): void;
    _no(sprite: Sprite, context: Context, x: number, y: number): void;
    _custom(sprite: Sprite, context: Context, x: number, y: number): void;
    _clip(sprite: Sprite, context: Context, x: number, y: number): void;
    _texture(sprite: Sprite, context: Context, x: number, y: number): void;
    _graphics(sprite: Sprite, context: Context, x: number, y: number): void;
    _image(sprite: Sprite, context: Context, x: number, y: number): void;
    _image2(sprite: Sprite, context: Context, x: number, y: number): void;
    _alpha(sprite: Sprite, context: Context, x: number, y: number): void;
    _transform(sprite: Sprite, context: Context, x: number, y: number): void;
    _children(sprite: Sprite, context: Context, x: number, y: number): void;
    _canvas(sprite: Sprite, context: Context, x: number, y: number): void;
    _canvas_repaint(sprite: Sprite, context: Context, x: number, y: number): void;
    _canvas_webgl_normal_repaint(sprite: Sprite, context: Context): void;
    _blend(sprite: Sprite, context: Context, x: number, y: number): void;
    /**
     * mask的渲染。 sprite有mask属性的情况下，来渲染这个sprite
     * @param	sprite
     * @param	context
     * @param	x
     * @param	y
     */
    _mask(sprite: Sprite, context: Context, x: number, y: number): void;
    static tempUV: any[];
    static tmpTarget(ctx: Context, rt: RenderTexture2D, w: number, h: number): void;
    static recycleTarget(rt: RenderTexture2D): void;
    static setBlendMode(blendMode: string): void;
}
