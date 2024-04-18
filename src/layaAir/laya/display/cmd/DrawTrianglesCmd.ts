import { ColorFilter } from "../../filters/ColorFilter"
import { Matrix } from "../../maths/Matrix"
import { Context } from "../../renders/Context"
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils"
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
    texture: Texture | null;
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
    matrix: Matrix | null;
    /**
     * alpha
     */
    alpha: number;
    //public var color:String;
    /**
     * blend模式
     */
    blendMode: string | null;
    /**
     * 颜色变换
     */
    color: number | null;

    /**@private */
    static create(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array,
        matrix: Matrix | null, alpha: number, color: string | number, blendMode: string | null): DrawTrianglesCmd {
        var cmd: DrawTrianglesCmd = Pool.getItemByClass("DrawTrianglesCmd", DrawTrianglesCmd);
        cmd.texture = texture;
        cmd.x = x;
        cmd.y = y;
        cmd.vertices = vertices;
        cmd.uvs = uvs;
        cmd.indices = indices;
        cmd.matrix = matrix;
        cmd.alpha = alpha;
        cmd.color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
        cmd.blendMode = blendMode;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.texture = null;
        this.vertices = null;
        this.uvs = null;
        this.indices = null;
        this.matrix = null;
        Pool.recover("DrawTrianglesCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawTriangles(this.texture, this.x + gx, this.y + gy, this.vertices, this.uvs, this.indices, this.matrix, this.alpha, this.blendMode, this.color);
    }

    /**@private */
    get cmdID(): string {
        return DrawTrianglesCmd.ID;
    }

    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        let vert = this.vertices;
        var vnum = vert.length;
        if (vnum < 2) return [];
        var minx = vert[0];
        var miny = vert[1];
        var maxx = minx;
        var maxy = miny;
        for (var i = 2; i < vnum;) {
            var cx = vert[i++];
            var cy = vert[i++];
            if (minx > cx) minx = cx;
            if (miny > cy) miny = cy;
            if (maxx < cx) maxx = cx;
            if (maxy < cy) maxy = cy;
        }

        return [minx, miny, maxx, miny, maxx, maxy, minx, maxy];
    }
}

ClassUtils.regClass("DrawTrianglesCmd", DrawTrianglesCmd);