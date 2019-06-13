import { ColorFilter } from "../../filters/ColorFilter"
import { Matrix } from "../../maths/Matrix"
import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { Pool } from "../../utils/Pool"

/**
 * 绘制单个贴图
 */
export class DrawTextureCmd {
	static ID: string = "DrawTexture";
	/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
	/**
	 * 纹理。
	 */
	texture: Texture;
	/**
	 * （可选）X轴偏移量。
	 */
	x: number;
	/**
	 * （可选）Y轴偏移量。
	 */
	y: number;
	/**
	 * （可选）宽度。
	 */
	width: number;
	/**
	 * （可选）高度。
	 */
	height: number;
	/**
	 * （可选）矩阵信息。
	 */
	matrix: Matrix;
	/**
	 * （可选）透明度。
	 */
	alpha: number;
	/**
	 * （可选）颜色滤镜。
	 */
	color: string;

	colorFlt: ColorFilter = null;
	/**
	 * （可选）混合模式。
	 */
	blendMode: string;

	/**@private */
	static create(texture: Texture, x: number, y: number, width: number, height: number, matrix: Matrix, alpha: number, color: string, blendMode: string): DrawTextureCmd {
		var cmd: DrawTextureCmd = Pool.getItemByClass("DrawTextureCmd", DrawTextureCmd);
		cmd.texture = texture;
		texture._addReference();
		cmd.x = x;
		cmd.y = y;
		cmd.width = width;
		cmd.height = height;
		cmd.matrix = matrix;
		cmd.alpha = alpha;
		cmd.color = color;
		cmd.blendMode = blendMode;
		if (color) {
			cmd.colorFlt = new ColorFilter();
			cmd.colorFlt.setColor(color);
		}

		return cmd;
	}

	/**
	 * 回收到对象池
	 */
	recover(): void {
		this.texture._removeReference();
		this.texture = null;
		this.matrix = null;
		Pool.recover("DrawTextureCmd", this);
	}

	/**@private */
	run(context: Context, gx: number, gy: number): void {
		context.drawTextureWithTransform(this.texture, this.x, this.y, this.width, this.height, this.matrix, gx, gy, this.alpha, this.blendMode, this.colorFlt);
	}

	/**@private */
	get cmdID(): string {
		return DrawTextureCmd.ID;
	}

}

