import { Context } from "../../resource/Context";
import { WordText } from "../../utils/WordText";
/**
 * 绘制文字
 */
export declare class FillTextCmd {
    static ID: string;
    private _text;
    /**
     * 开始绘制文本的 x 坐标位置（相对于画布）。
     */
    x: number;
    /**
     * 开始绘制文本的 y 坐标位置（相对于画布）。
     */
    y: number;
    private _font;
    private _color;
    private _textAlign;
    private _fontColor;
    private _strokeColor;
    private static _defFontObj;
    private _fontObj;
    private _nTexAlign;
    /**@private */
    static create(text: string | WordText, x: number, y: number, font: string, color: string, textAlign: string): FillTextCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
    /**
     * 在画布上输出的文本。
     */
    text: string | WordText;
    /**
     * 定义字号和字体，比如"20px Arial"。
     */
    font: string;
    /**
     * 定义文本颜色，比如"#ff0000"。
     */
    color: string;
    /**
     * 文本对齐方式，可选值："left"，"center"，"right"。
     */
    textAlign: string;
}
