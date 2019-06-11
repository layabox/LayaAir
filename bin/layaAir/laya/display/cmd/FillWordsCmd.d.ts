import { Context } from "../../resource/Context";
/**
 * 填充文字命令
 * @private
 */
export declare class FillWordsCmd {
    static ID: string;
    /**
     * 文字数组
     */
    words: any[];
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
    color: string;
    /**@private */
    static create(words: any[], x: number, y: number, font: string, color: string): FillWordsCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
