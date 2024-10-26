import { Matrix } from "../../maths/Matrix"
import { Context } from "../../renders/Context"
import { Pool } from "../../utils/Pool"

/**
 * @en Transform command
 * @zh 矩阵变换命令
 */
export class TransformCmd {
    /**
     * @en Identifier for the TransformCmd
     * @zh 矩阵变换命令的标识符
     */
    static ID: string = "Transform";

    /**
     * @en The transformation matrix.
     * @zh 变换矩阵。
     */
    matrix: Matrix;
    /**
     * @en (Optional) Horizontal axis point coordinates.
     * @zh （可选）水平方向轴心点坐标。
     */
    pivotX: number;
    /**
     * @en (Optional) Vertical axis point coordinates.
     * @zh （可选）垂直方向轴心点坐标。
     */
    pivotY: number;

    /**
     * @en Create a TransformCmd instance
     * @param matrix The transformation matrix
     * @param pivotX Horizontal axis point coordinates
     * @param pivotY Vertical axis point coordinates
     * @returns TransformCmd instance
     * @zh 创建一个矩阵变换命令实例
     * @param matrix 变换矩阵
     * @param pivotX 水平方向轴心点坐标
     * @param pivotY 垂直方向轴心点坐标
     * @returns 矩阵变换命令实例
     */
    static create(matrix: Matrix, pivotX: number, pivotY: number): TransformCmd {
        var cmd: TransformCmd = Pool.getItemByClass("TransformCmd", TransformCmd);
        cmd.matrix = matrix;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.matrix = null;
        Pool.recover("TransformCmd", this);
    }

    /**
     * @en Execute the transform command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行矩阵变换命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        context._transform(this.matrix, this.pivotX + gx, this.pivotY + gy);
    }

    /**
     * @en The identifier for the TransformCmd
     * @zh 矩阵变换命令的标识符
     */
    get cmdID(): string {
        return TransformCmd.ID;
    }

}

