import { HTMLCanvas } from "./laya/resource/HTMLCanvas";
import { Context } from "./laya/resource/Context";
/**
 * 全局canvas对象
 * 为了解除互相引用而加
 *
 */
/**@private */
export declare class GCanvas {
    static MainCanvas: HTMLCanvas;
    static MainCtx: Context;
    static canvas: HTMLCanvas;
    static context: Context;
}
