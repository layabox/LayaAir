import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../resource/Context";
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool";

export class DrawEllipseCmd {
    static ID: string = "DrawEllipse";
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
    static create(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): DrawEllipseCmd {
        var cmd = Pool.getItemByClass("DrawEllipseCmd", DrawEllipseCmd);
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
        Pool.recover("DrawEllipseCmd", this);
    }
    /**@private */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context._drawEllipse(this.x * w + gx, this.y * h + gy, this.width * w - offset, this.height * h - offset, this.fillColor, this.lineColor, this.lineWidth);
        }
        else {
            context._drawEllipse(this.x + gx, this.y + gy, this.width - offset, this.height - offset, this.fillColor, this.lineColor, this.lineWidth);
        }
    }
    /**@private */
    get cmdID(): string {
        return DrawEllipseCmd.ID;
    }
    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        return Rectangle._getBoundPointS(this.x - this.width, this.y - this.height, this.width * 2, this.height * 2, this.percent ? sp : null);
    }

}

ClassUtils.regClass("DrawEllipseCmd", DrawEllipseCmd);