import { Context } from "../../resource/Context";
/**
 * 绘制文本边框
 */
export declare class FillBorderTextCmd {
    static ID: string;
    /**
     * 在画布上输出的文本。
     */
    text: string;
    /**
     * 开始绘制文本的 x 坐标位置（相对于画布）。
     */
    x: number;
    /**
     * 开始绘制文本的 y 坐标位置（相对于画布）。
     */
    y: number;
    /**
     * 定义字体和字号，比如"20px Arial"。
     */
    font: string;
    /**
     * 定义文本颜色，比如"#ff0000"。
     */
    fillColor: string;
    /**
     * 定义镶边文本颜色。
     */
    borderColor: string;
    /**
     * 镶边线条宽度。
     */
    lineWidth: number;
    /**
     * 文本对齐方式，可选值："left"，"center"，"right"。
     */
    textAlign: string;
    /**@private */
    static create(text: string, x: number, y: number, font: string, fillColor: string, borderColor: string, lineWidth: number, textAlign: string): FillBorderTextCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
