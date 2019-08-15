import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 透明命令
 */
export class AlphaCmd {
    static ID: string = "Alpha";

    /**
     * 透明度
     */
    alpha: number;

    /**@private */
    static create(alpha: number): AlphaCmd {
        var cmd: AlphaCmd = Pool.getItemByClass("AlphaCmd", AlphaCmd);
        cmd.alpha = alpha;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        Pool.recover("AlphaCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.alpha(this.alpha);
    }

    /**@private */
    get cmdID(): string {
        return AlphaCmd.ID;
    }
}

