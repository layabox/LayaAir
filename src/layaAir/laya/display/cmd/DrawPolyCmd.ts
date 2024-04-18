import { Context } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * 绘制多边形
 */
export class DrawPolyCmd {
    /**绘制多边形CMD的标识符 */
    static ID: string = "DrawPoly";

    /**
     * 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * 多边形的点集合。
     */
    points: number[] | null;
    /**
     * 填充颜色，或者填充绘图的渐变对象。
     */
    fillColor: any;
    /**
     * （可选）边框颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * 可选）边框宽度。
     */
    lineWidth: number;

    /**@private 创建绘制多边形CMD*/
    static create(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number): DrawPolyCmd {
        var cmd: DrawPolyCmd = Pool.getItemByClass("DrawPolyCmd", DrawPolyCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.points = points;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.points = null;
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawPolyCmd", this);
    }

    /**@private 执行绘制多边形CMD*/
    run(context: Context, gx: number, gy: number): void {
        let isConvexPolygon = this.points.length <= 6;
        let offset = (this.lineWidth >= 1 && this.lineColor) ? (this.lineWidth % 2 === 0 ? 0 : 0.5) : 0;
        this.points && context._drawPoly(this.x + offset + gx, this.y + offset + gy, this.points, this.fillColor, this.lineColor, this.lineWidth, isConvexPolygon, 0);
    }

    /**@private 获取绘制多边形CMD的标识符*/
    get cmdID(): string {
        return DrawPolyCmd.ID;
    }
}

ClassUtils.regClass("DrawPolyCmd", DrawPolyCmd);