import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 绘制边框
 * @private
 */
export class FillBorderWordsCmd {
	static ID: string = "FillBorderWords";
	/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
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
	fillColor: string;
	/**
	 * 定义镶边文本颜色。
	 */
	borderColor: string;
	/**
	 * 镶边线条宽度。
	 */
	lineWidth: number;

	/**@private */
	static create(words: any[], x: number, y: number, font: string, fillColor: string, borderColor: string, lineWidth: number): FillBorderWordsCmd {
		var cmd: FillBorderWordsCmd = Pool.getItemByClass("FillBorderWordsCmd", FillBorderWordsCmd);
		cmd.words = words;
		cmd.x = x;
		cmd.y = y;
		cmd.font = font;
		cmd.fillColor = fillColor;
		cmd.borderColor = borderColor;
		cmd.lineWidth = lineWidth;
		return cmd;
	}

	/**
	 * 回收到对象池
	 */
	recover(): void {
		this.words = null;
		Pool.recover("FillBorderWordsCmd", this);
	}

	/**@private */
	run(context: Context, gx: number, gy: number): void {
		context.fillBorderWords(this.words, this.x + gx, this.y + gy, this.font, this.fillColor, this.borderColor, this.lineWidth);
	}

	/**@private */
	get cmdID(): string {
		return FillBorderWordsCmd.ID;
	}

}

