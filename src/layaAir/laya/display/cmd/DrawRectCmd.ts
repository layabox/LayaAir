import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../resource/Context"
import { ClassUtils } from "../../utils/ClassUtils";
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

    /**
     * 位置和大小是否是百分比
     */
    percent: boolean;

    /**@private */
    static create(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawRectCmd {
        var cmd: DrawRectCmd = Pool.getItemByClass("DrawRectCmd", DrawRectCmd);
        var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
        var lineOffset = lineColor ? lineWidth : 0;
        cmd.x = x + offset;
        cmd.y = y + offset;
        cmd.width = width - lineOffset;
        cmd.height = height - lineOffset;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.percent = percent;
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
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context.drawRect(this.x * w + gx, this.y * h + gy, this.width * w, this.height * h, this.fillColor, this.lineColor, this.lineWidth);
        }
        else
            context.drawRect(this.x + gx, this.y + gy, this.width, this.height, this.fillColor, this.lineColor, this.lineWidth);
    }

    /**@private */
    get cmdID(): string {
        return DrawRectCmd.ID;
    }

    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        return Rectangle._getBoundPointS(this.x, this.y, this.width, this.height, this.percent ? sp : null)
    }
}

ClassUtils.regClass("DrawRectCmd", DrawRectCmd);

