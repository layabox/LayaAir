import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../resource/Context"
import { ClassUtils } from "../../utils/ClassUtils";
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
    lineWidth: number = 0;

    /**
     * 位置和大小是否是百分比
     */
    percent: boolean;

    /**@private */
    static create(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number): DrawCircleCmd {
        var cmd: DrawCircleCmd = Pool.getItemByClass("DrawCircleCmd", DrawCircleCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
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
        Pool.recover("DrawCircleCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        let offset = this.lineWidth / 2;
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context._drawCircle(this.x * w + gx, this.y * h + gy, this.radius * w - offset, this.fillColor, this.lineColor, this.lineWidth, 0);
        }
        else
            context._drawCircle(this.x + gx, this.y + gy, this.radius - offset, this.fillColor, this.lineColor, this.lineWidth, 0);
    }

    /**@private */
    get cmdID(): string {
        return DrawCircleCmd.ID;
    }

    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        return Rectangle._getBoundPointS(this.x - this.radius, this.y - this.radius, this.radius + this.radius, this.radius + this.radius, this.percent ? sp : null);
    }
}

ClassUtils.regClass("DrawCircleCmd", DrawCircleCmd);
