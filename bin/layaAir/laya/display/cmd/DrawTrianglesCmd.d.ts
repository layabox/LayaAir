import { ColorFilter } from "../../filters/ColorFilter";
import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
/**
 * 绘制三角形命令
 */
export declare class DrawTrianglesCmd {
    static ID: string;
    /**
     * 纹理。
     */
    texture: Texture;
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
    matrix: Matrix;
    /**
     * alpha
     */
    alpha: number;
    /**
     * blend模式
     */
    blendMode: string;
    /**
     * 颜色变换
     */
    color: ColorFilter;
    /**@private */
    static create(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, matrix: Matrix, alpha: number, color: string, blendMode: string): DrawTrianglesCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
