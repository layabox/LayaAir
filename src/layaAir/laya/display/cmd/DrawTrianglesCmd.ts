import { ColorFilter } from "../../filters/ColorFilter"
import { Matrix } from "../../maths/Matrix"
import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { ColorUtils } from "../../utils/ColorUtils"
import { Pool } from "../../utils/Pool"

/**
 * 绘制三角形命令
 */
export class DrawTrianglesCmd {
    static ID: string = "DrawTriangles";

    /**
     * 纹理。
     */
    texture: Texture|null;
    /**
     * X轴偏移量。
     */
    x: number;
    /**
     * Y轴偏移量。
     */
    y: number;
    /**
     * 顶点数组。
     */
    vertices: Float32Array;
    /**
     * UV数据。
     */
    uvs: Float32Array;
    /**
     * 顶点索引。
     */
    indices: Uint16Array;
    /**
     * 缩放矩阵。
     */
    matrix: Matrix|null;
    /**
     * alpha
     */
    alpha: number;
    //public var color:String;
    /**
     * blend模式
     */
    blendMode: string|null;
    /**
     * 颜色变换
     */
    color: ColorFilter;

    colorNum: number|null;

    /**@private */
	static create(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, 
			matrix: Matrix|null, alpha: number, color: string|null, blendMode: string|null, colorNum: number|null): DrawTrianglesCmd {
        var cmd: DrawTrianglesCmd = Pool.getItemByClass("DrawTrianglesCmd", DrawTrianglesCmd);
        cmd.texture = texture;
        cmd.x = x;
        cmd.y = y;
        cmd.vertices = vertices;
        cmd.uvs = uvs;
        cmd.indices = indices;
        cmd.matrix = matrix;
        cmd.alpha = alpha;
        if (color) {
            cmd.color = new ColorFilter();
            var c: any[] = ColorUtils.create(color).arrColor;
            cmd.color.color(c[0] * 255, c[1] * 255, c[2] * 255, c[3] * 255);	//TODO 这个好像设置的是加色，这样并不合理
        }
        cmd.blendMode = blendMode;
        cmd.colorNum = colorNum;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
		this.texture = null;
		//@ts-ignore
		this.vertices = null;
		//@ts-ignore
		this.uvs = null;
		//@ts-ignore
        this.indices = null;
        this.matrix = null;
        Pool.recover("DrawTrianglesCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawTriangles(this.texture, this.x + gx, this.y + gy, this.vertices, this.uvs, this.indices, this.matrix, this.alpha, this.color, this.blendMode, this.colorNum);
    }

    /**@private */
    get cmdID(): string {
        return DrawTrianglesCmd.ID;
    }

}

