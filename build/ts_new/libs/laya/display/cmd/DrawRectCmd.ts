import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 绘制矩形
 */
export class DrawRectCmd {
    static ID: string = "DrawRect";

    /**
     * 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * 矩形宽度。
     */
    width: number;
    /**
     * 矩形高度。
     */
    height: number;
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
    static create(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): DrawRectCmd {
        var cmd: DrawRectCmd = Pool.getItemByClass("DrawRectCmd", DrawRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawRectCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawRect(this.x + gx, this.y + gy, this.width, this.height, this.fillColor, this.lineColor, this.lineWidth);
    }

    /**@private */
    get cmdID(): string {
        return DrawRectCmd.ID;
    }

}

