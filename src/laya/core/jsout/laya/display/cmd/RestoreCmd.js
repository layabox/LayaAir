import { Pool } from "../../utils/Pool";
/**
 * 恢复命令，和save配套使用
 */
export class RestoreCmd {
    /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
    /**@private */
    static create() {
        var cmd = Pool.getItemByClass("RestoreCmd", RestoreCmd);
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("RestoreCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.restore();
    }
    /**@private */
    get cmdID() {
        return RestoreCmd.ID;
    }
}
RestoreCmd.ID = "Restore";
