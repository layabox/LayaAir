import { Context } from "../../resource/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * 绘制连续曲线
 */
export class DrawLinesCmd {
    static ID: string = "DrawLines";

    /**
     * 开始绘制的X轴位置。
     */
    x: number;
    /**
     * 开始绘制的Y轴位置。
     */
    y: number;
    /**
     * 线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
     */
    points: number[] | null;
    /**
     * 线段颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * （可选）线段宽度。
     */
    lineWidth: number = 0;

    /**@private */
    static create(x: number, y: number, points: any[], lineColor: any, lineWidth: number): DrawLinesCmd {
        var cmd: DrawLinesCmd = Pool.getItemByClass("DrawLinesCmd", DrawLinesCmd);
        //TODO 线段需要缓存
        cmd.x = x;
        cmd.y = y;
        cmd.points = points;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.points = null;
        this.lineColor = null;
        Pool.recover("DrawLinesCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth < 1 || this.lineWidth % 2 === 0) ? 0 : 0.5;
        this.points && context._drawLines(this.x + offset + gx, this.y + offset + gy, this.points, this.lineColor, this.lineWidth, 0);
    }

    /**@private */
    get cmdID(): string {
        return DrawLinesCmd.ID;
    }

}

ClassUtils.regClass("DrawLinesCmd", DrawLinesCmd);