import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 恢复命令，和save配套使用
 */
export class RestoreCmd {
    static ID: string = "Restore";



    /**@private */
    static create(): RestoreCmd {
        var cmd: RestoreCmd = Pool.getItemByClass("RestoreCmd", RestoreCmd);

        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {

        Pool.recover("RestoreCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.restore();
    }

    /**@private */
    get cmdID(): string {
        return RestoreCmd.ID;
    }

}

