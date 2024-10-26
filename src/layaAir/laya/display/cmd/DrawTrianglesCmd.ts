import { Matrix } from "../../maths/Matrix"
import { Context } from "../../renders/Context"
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils"
import { ColorUtils } from "../../utils/ColorUtils"
import { Pool } from "../../utils/Pool"

/**
 * @en Draw triangles command
 * @zh 绘制三角形命令
 */
export class DrawTrianglesCmd {
    /**
     * @en Identifier for the DrawTrianglesCmd
     * @zh 绘制三角形命令的标识符
     */
    static ID: string = "DrawTriangles";

    /**
     * @en The texture to be drawn.
     * @zh 要绘制的纹理。
     */
    texture: Texture | null;
    /**
     * @en X-axis offset.
     * @zh X轴偏移量。
     */
    x: number;
    /**
     * @en Y-axis offset.
     * @zh Y轴偏移量。
     */
    y: number;
    /**
     * @en Vertex array.
     * @zh 顶点数组。
     */
    vertices: Float32Array;
    /**
     * @en UV data.
     * @zh UV数据。
     */
    uvs: Float32Array;
    /**
     * @en Vertex indices.
     * @zh 顶点索引。
     */
    indices: Uint16Array;
    /**
     * @en Scaling matrix.
     * @zh 缩放矩阵。
     */
    matrix: Matrix | null;
    /**
     * @en Alpha value.
     * @zh 透明度值。
     */
    alpha: number;
    //public var color:String;
    /**
     * @en Blend mode.
     * @zh 混合模式。
     */
    blendMode: string | null;
    /**
     * @en Color transformation.
     * @zh 颜色变换。
     */
    color: number | null;

    /**
     * @en Create a DrawTrianglesCmd instance
     * @param texture The texture to be drawn
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param vertices Vertex array
     * @param uvs UV data
     * @param indices Vertex indices
     * @param matrix Scaling matrix
     * @param alpha Alpha value
     * @param color Color transformation
     * @param blendMode Blend mode
     * @returns DrawTrianglesCmd instance
     * @zh 创建一个绘制三角形命令实例
     * @param texture 要绘制的纹理  
     * @param x X轴偏移量  
     * @param y Y轴偏移量  
     * @param vertices 顶点数组  
     * @param uvs UV数据  
     * @param indices 顶点索引  
     * @param matrix 缩放矩阵  
     * @param alpha 透明度值  
     * @param color 颜色变换  
     * @param blendMode 混合模式  
     * @returns 绘制三角形命令实例
     */
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
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.texture = null;
        this.vertices = null;
        this.uvs = null;
        this.indices = null;
        this.matrix = null;
        Pool.recover("DrawTrianglesCmd", this);
    }

    /**
     * @en Execute the drawing triangles command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制三角形命令
     * @param context 渲染上下文  
     * @param gx 全局X偏移  
     * @param gy 全局Y偏移  
     */
    run(context: Context, gx: number, gy: number): void {
        context.drawTriangles(this.texture, this.x + gx, this.y + gy, this.vertices, this.uvs, this.indices, this.matrix, this.alpha, this.blendMode, this.color);
    }

    /**
     * @en The identifier for the DrawTrianglesCmd
     * @zh 绘制三角形命令的标识符
     */
    get cmdID(): string {
        return DrawTrianglesCmd.ID;
    }

    /**
     * @en Get the boundary points of the triangles
     * @zh 获取三角形的边界点
     */
    getBoundPoints(): number[] {
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