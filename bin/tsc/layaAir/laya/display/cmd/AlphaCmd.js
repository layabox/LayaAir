import { Pool } from "../../utils/Pool";
/**
 * 透明命令
 */
export class AlphaCmd {
    /**@private */
    static create(alpha) {
        var cmd = Pool.getItemByClass("AlphaCmd", AlphaCmd);
        cmd.alpha = alpha;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("AlphaCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.alpha(this.alpha);
    }
    /**@private */
    get cmdID() {
        return AlphaCmd.ID;
    }
}
AlphaCmd.ID = "Alpha";
