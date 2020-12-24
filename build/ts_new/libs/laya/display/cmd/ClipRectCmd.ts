import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 裁剪命令
 */
export class ClipRectCmd {
    static ID: string = "ClipRect";


    /**
     * X 轴偏移量。
     */
    x: number;
    /**
     * Y 轴偏移量。
     */
    y: number;
    /**
     * 宽度。
     */
    width: number;
    /**
     * 高度。
     */
    height: number;

    /**@private */
    static create(x: number, y: number, width: number, height: number): ClipRectCmd {
        var cmd: ClipRectCmd = Pool.getItemByClass("ClipRectCmd", ClipRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {

        Pool.recover("ClipRectCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.clipRect(this.x + gx, this.y + gy, this.width, this.height);
    }

    /**@private */
    get cmdID(): string {
        return ClipRectCmd.ID;
    }

}

