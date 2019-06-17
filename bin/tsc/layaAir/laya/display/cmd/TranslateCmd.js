import { Pool } from "../../utils/Pool";
/**
 * 位移命令
 */
export class TranslateCmd {
    /**@private */
    static create(tx, ty) {
        var cmd = Pool.getItemByClass("TranslateCmd", TranslateCmd);
        cmd.tx = tx;
        cmd.ty = ty;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("TranslateCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.translate(this.tx, this.ty);
    }
    /**@private */
    get cmdID() {
        return TranslateCmd.ID;
    }
}
TranslateCmd.ID = "Translate";
