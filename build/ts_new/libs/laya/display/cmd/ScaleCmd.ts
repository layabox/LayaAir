import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"
/**
 * 缩放命令
 */
export class ScaleCmd {
    static ID: string = "Scale";

    /**
     * 水平方向缩放值。
     */
    scaleX: number;
    /**
     * 垂直方向缩放值。
     */
    scaleY: number;
    /**
     * （可选）水平方向轴心点坐标。
     */
    pivotX: number;
    /**
     * （可选）垂直方向轴心点坐标。
     */
    pivotY: number;

    /**@private */
    static create(scaleX: number, scaleY: number, pivotX: number, pivotY: number): ScaleCmd {
        var cmd: ScaleCmd = Pool.getItemByClass("ScaleCmd", ScaleCmd);
        cmd.scaleX = scaleX;
        cmd.scaleY = scaleY;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {

        Pool.recover("ScaleCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context._scale(this.scaleX, this.scaleY, this.pivotX + gx, this.pivotY + gy);
    }

    /**@private */
    get cmdID(): string {
        return ScaleCmd.ID;
    }

}

