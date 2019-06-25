import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
/**
 * 矩阵命令
 */
export declare class TransformCmd {
    static ID: string;
    /**
     * 矩阵。
     */
    matrix: Matrix;
    /**
     * （可选）水平方向轴心点坐标。
     */
    pivotX: number;
    /**
     * （可选）垂直方向轴心点坐标。
     */
    pivotY: number;
    /**@private */
    static create(matrix: Matrix, pivotX: number, pivotY: number): TransformCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
