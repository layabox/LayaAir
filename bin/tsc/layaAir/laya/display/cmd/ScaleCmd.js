import { Pool } from "../../utils/Pool";
/**
 * 缩放命令
 */
export class ScaleCmd {
    /**@private */
    static create(scaleX, scaleY, pivotX, pivotY) {
        var cmd = Pool.getItemByClass("ScaleCmd", ScaleCmd);
        cmd.scaleX = scaleX;
        cmd.scaleY = scaleY;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("ScaleCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context._scale(this.scaleX, this.scaleY, this.pivotX + gx, this.pivotY + gy);
    }
    /**@private */
    get cmdID() {
        return ScaleCmd.ID;
    }
}
ScaleCmd.ID = "Scale";
