import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 绘制圆形
 */
export class DrawCircleCmd {
    static ID: string = "DrawCircle";

    /**
     * 圆点X 轴位置。
     */
    x: number;
    /**
     * 圆点Y 轴位置。
     */
    y: number;
    /**
     * 半径。
     */
    radius: number;
    /**
     * 填充颜色，或者填充绘图的渐变对象。
     */
    fillColor: any;
    /**
     * （可选）边框颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * （可选）边框宽度。
     */
    lineWidth: number;
    /**@private */
    vid: number;

    /**@private */
    static create(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): DrawCircleCmd {
        var cmd: DrawCircleCmd = Pool.getItemByClass("DrawCircleCmd", DrawCircleCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawCircleCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context._drawCircle(this.x + gx, this.y + gy, this.radius, this.fillColor, this.lineColor, this.lineWidth, this.vid);
    }

    /**@private */
    get cmdID(): string {
        return DrawCircleCmd.ID;
    }

}

