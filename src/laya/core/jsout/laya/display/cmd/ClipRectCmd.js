import { Pool } from "../../utils/Pool";
/**
 * 裁剪命令
 */
export class ClipRectCmd {
    /**@private */
    static create(x, y, width, height) {
        var cmd = Pool.getItemByClass("ClipRectCmd", ClipRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("ClipRectCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.clipRect(this.x + gx, this.y + gy, this.width, this.height);
    }
    /**@private */
    get cmdID() {
        return ClipRectCmd.ID;
    }
}
ClipRectCmd.ID = "ClipRect";
