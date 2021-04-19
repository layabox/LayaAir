import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 存储命令，和restore配套使用
 */
export class SaveCmd {
    static ID: string = "Save";



    /**@private */
    static create(): SaveCmd {
        var cmd: SaveCmd = Pool.getItemByClass("SaveCmd", SaveCmd);

        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {

        Pool.recover("SaveCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.save();
    }

    /**@private */
    get cmdID(): string {
        return SaveCmd.ID;
    }

}

