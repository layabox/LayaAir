import { Pool } from "../../utils/Pool";
/**
 * 矩阵命令
 */
export class TransformCmd {
    /**@private */
    static create(matrix, pivotX, pivotY) {
        var cmd = Pool.getItemByClass("TransformCmd", TransformCmd);
        cmd.matrix = matrix;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.matrix = null;
        Pool.recover("TransformCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context._transform(this.matrix, this.pivotX + gx, this.pivotY + gy);
    }
    /**@private */
    get cmdID() {
        return TransformCmd.ID;
    }
}
TransformCmd.ID = "Transform";
