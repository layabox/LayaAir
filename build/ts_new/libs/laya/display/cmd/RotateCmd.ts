import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 旋转命令
 */
export class RotateCmd {
    static ID: string = "Rotate";

    /**
     * 旋转角度，以弧度计。
     */
    angle: number;
    /**
     * （可选）水平方向轴心点坐标。
     */
    pivotX: number;
    /**
     * （可选）垂直方向轴心点坐标。
     */
    pivotY: number;

    /**@private */
    static create(angle: number, pivotX: number, pivotY: number): RotateCmd {
        var cmd: RotateCmd = Pool.getItemByClass("RotateCmd", RotateCmd);
        cmd.angle = angle;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {

        Pool.recover("RotateCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context._rotate(this.angle, this.pivotX + gx, this.pivotY + gy);
    }

    /**@private */
    get cmdID(): string {
        return RotateCmd.ID;
    }

}

