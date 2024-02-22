import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../renders/Context";
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool";

export class DrawRoundRectCmd {
    static ID: string = "DrawRoundRect";
    /**
     * 圆点X 轴位置。
     */
    x: number;
    /**
     * 圆点Y 轴位置。
     */
    y: number;
    /**
     * 横向半径。
     */
    width: number;
    /**
     * 纵向半径。
     */
    height: number;
    /**
     * 左上圆角
     */
    lt: number;
    /**
     * 右上圆角
     */
    rt: number;
    /**
     * 左下圆角
     */
    lb: number;
    /**
     * 右下圆角
     */
    rb: number;
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
    lineWidth: number = 0;

    /**
     * 位置和大小是否是百分比
     */
    percent: boolean;


    /**@private */
    static create(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawRoundRectCmd {
        var cmd = Pool.getItemByClass("DrawRoundRectCmd", DrawRoundRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.lt = lt;
        cmd.rt = rt;
        cmd.lb = lb;
        cmd.rb = rb;
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
        Pool.recover("DrawRoundRectCmd", this);
    }
    /**@private */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        let lineOffset = this.lineColor ? this.lineWidth : 0;
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context._drawRoundRect(this.x * w + offset + gx, this.y * h + offset + gy, this.width * w - lineOffset, this.height * h - lineOffset, this.lt, this.rt, this.lb, this.rb, this.fillColor, this.lineColor, this.lineWidth);
        }
        else {
            context._drawRoundRect(this.x + offset + gx, this.y + offset + gy, this.width - lineOffset, this.height - lineOffset, this.lt, this.rt, this.lb, this.rb, this.fillColor, this.lineColor, this.lineWidth);
        }
    }
    /**@private */
    get cmdID(): string {
        return DrawRoundRectCmd.ID;
    }
    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        return Rectangle._getBoundPointS(this.x, this.y, this.width, this.height, this.percent ? sp : null);
    }

}

ClassUtils.regClass("DrawRoundRectCmd", DrawRoundRectCmd);