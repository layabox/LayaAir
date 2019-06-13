import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 填充文字命令
 * @private
 */
export class FillWordsCmd {
	static ID: string = "FillWords";
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
	color: string;

	/**@private */
	static create(words: any[], x: number, y: number, font: string, color: string): FillWordsCmd {
		var cmd: FillWordsCmd = Pool.getItemByClass("FillWordsCmd", FillWordsCmd);
		cmd.words = words;
		cmd.x = x;
		cmd.y = y;
		cmd.font = font;
		cmd.color = color;
		return cmd;
	}

	/**
	 * 回收到对象池
	 */
	recover(): void {
		this.words = null;
		Pool.recover("FillWordsCmd", this);
	}

	/**@private */
	run(context: Context, gx: number, gy: number): void {
		context.fillWords(this.words, this.x + gx, this.y + gy, this.font, this.color);
	}

	/**@private */
	get cmdID(): string {
		return FillWordsCmd.ID;
	}

}

