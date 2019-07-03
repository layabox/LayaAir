import { Bitmap } from "./Bitmap";
import { Texture } from "./Texture";
import { Context } from "./Context";
/**
 * <code>HTMLCanvas</code> 是 Html Canvas 的代理类，封装了 Canvas 的属性和方法。
 */
export declare class HTMLCanvas extends Bitmap {
    private _ctx;
    /**
     * @inheritDoc
     */
    readonly source: any;
    /**
     * 根据指定的类型，创建一个 <code>HTMLCanvas</code> 实例。
     */
    constructor(createCanvas?: boolean);
    /**
     * 清空画布内容。
     */
    clear(): void;
    /**
     * 销毁。
     */
    destroy(): void;
    /**
     * 释放。
     */
    release(): void;
    /**
     * Canvas 渲染上下文。
     */
    readonly context: Context;
    /**
     * 获取 Canvas 渲染上下文。
     * @param	contextID 上下文ID.
     * @param	other
     * @return  Canvas 渲染上下文 Context 对象。
     */
    getContext(contextID: string, other?: any): Context;
    /**
     * 获取内存大小。
     * @return 内存大小。
     */
    getMemSize(): number;
    /**
     * 设置宽高。
     * @param	w 宽度。
     * @param	h 高度。
     */
    size(w: number, h: number): void;
    /**
     * 获取texture实例
     */
    getTexture(): Texture;
    /**
     * 把图片转换为base64信息
     * @param	type "image/png"
     * @param	encoderOptions	质量参数，取值范围为0-1
     */
    toBase64(type: string, encoderOptions: number): string;
    toBase64Async(type: string, encoderOptions: number, callBack: Function): void;
}
