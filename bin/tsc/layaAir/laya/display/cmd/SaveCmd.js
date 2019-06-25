import { Pool } from "../../utils/Pool";
/**
 * 存储命令，和restore配套使用
 */
export class SaveCmd {
    /**@private */
    static create() {
        var cmd = Pool.getItemByClass("SaveCmd", SaveCmd);
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("SaveCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.save();
    }
    /**@private */
    get cmdID() {
        return SaveCmd.ID;
    }
}
SaveCmd.ID = "Save";
