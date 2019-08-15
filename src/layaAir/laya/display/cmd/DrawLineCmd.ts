import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 绘制单条曲线
 */
export class DrawLineCmd {
    static ID: string = "DrawLine";

    /**
     * X轴开始位置。
     */
    fromX: number;
    /**
     * Y轴开始位置。
     */
    fromY: number;
    /**
     * X轴结束位置。
     */
    toX: number;
    /**
     * Y轴结束位置。
     */
    toY: number;
    /**
     * 颜色。
     */
    lineColor: string;
    /**
     * （可选）线条宽度。
     */
    lineWidth: number;
    /**@private */
    vid: number;

    /**@private */
    static create(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number, vid: number): DrawLineCmd {
        var cmd: DrawLineCmd = Pool.getItemByClass("DrawLineCmd", DrawLineCmd);
        cmd.fromX = fromX;
        cmd.fromY = fromY;
        cmd.toX = toX;
        cmd.toY = toY;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        Pool.recover("DrawLineCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context._drawLine(gx, gy, this.fromX, this.fromY, this.toX, this.toY, this.lineColor, this.lineWidth, this.vid);
    }

    /**@private */
    get cmdID(): string {
        return DrawLineCmd.ID;
    }

}

