import { Matrix } from "../../maths/Matrix"
import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 矩阵命令
 */
export class TransformCmd {
    static ID: string = "Transform";

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
    static create(matrix: Matrix, pivotX: number, pivotY: number): TransformCmd {
        var cmd: TransformCmd = Pool.getItemByClass("TransformCmd", TransformCmd);
        cmd.matrix = matrix;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.matrix = null;
        Pool.recover("TransformCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context._transform(this.matrix, this.pivotX + gx, this.pivotY + gy);
    }

    /**@private */
    get cmdID(): string {
        return TransformCmd.ID;
    }

}

