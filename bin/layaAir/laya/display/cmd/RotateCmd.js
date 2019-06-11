import { Pool } from "../../utils/Pool";
/**
 * 旋转命令
 */
export class RotateCmd {
    /**@private */
    static create(angle, pivotX, pivotY) {
        var cmd = Pool.getItemByClass("RotateCmd", RotateCmd);
        cmd.angle = angle;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("RotateCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context._rotate(this.angle, this.pivotX + gx, this.pivotY + gy);
    }
    /**@private */
    get cmdID() {
        return RotateCmd.ID;
    }
}
RotateCmd.ID = "Rotate";
