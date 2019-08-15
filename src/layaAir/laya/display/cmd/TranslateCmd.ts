import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"
/**
 * 位移命令
 */
export class TranslateCmd {
    static ID: string = "Translate";

    /**
     * 添加到水平坐标（x）上的值。
     */
    tx: number;
    /**
     * 添加到垂直坐标（y）上的值。
     */
    ty: number;

    /**@private */
    static create(tx: number, ty: number): TranslateCmd {
        var cmd: TranslateCmd = Pool.getItemByClass("TranslateCmd", TranslateCmd);
        cmd.tx = tx;
        cmd.ty = ty;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {

        Pool.recover("TranslateCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.translate(this.tx, this.ty);
    }

    /**@private */
    get cmdID(): string {
        return TranslateCmd.ID;
    }

}

