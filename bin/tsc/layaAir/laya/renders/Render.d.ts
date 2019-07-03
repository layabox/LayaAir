import { Context } from "../resource/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
/**
 * <code>Render</code> 是渲染管理类。它是一个单例，可以使用 Laya.render 访问。
 */
export declare class Render {
    static supportWebGLPlusCulling: boolean;
    static supportWebGLPlusAnimation: boolean;
    static supportWebGLPlusRendering: boolean;
    /**是否是加速器 只读*/
    static isConchApp: boolean;
    /** 表示是否是 3D 模式。*/
    static is3DMode: boolean;
    /**
     * 初始化引擎。
     * @param	width 游戏窗口宽度。
     * @param	height	游戏窗口高度。
     */
    constructor(width: number, height: number, mainCanv: HTMLCanvas);
    /**@private */
    private _timeId;
    /**@private */
    private _onVisibilitychange;
    initRender(canvas: HTMLCanvas, w: number, h: number): boolean;
    /**@private */
    private _enterFrame;
    /** 目前使用的渲染器。*/
    static readonly context: Context;
    /** 渲染使用的原生画布引用。 */
    static readonly canvas: any;
}
