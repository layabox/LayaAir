import { Context } from "../../resource/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * 绘制多边形
 */
export class DrawPolyCmd {
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
    /**@private */
    isConvexPolygon: boolean;

    /**@private */
    static create(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number): DrawPolyCmd {
        var cmd: DrawPolyCmd = Pool.getItemByClass("DrawPolyCmd", DrawPolyCmd);
        var tIsConvexPolygon = false;
        //这里加入多加形是否是凸边形
        if (points.length > 6) {
            tIsConvexPolygon = false;
        } else {
            tIsConvexPolygon = true;
        }
        var offset = (lineWidth >= 1 && lineColor) ? (lineWidth % 2 === 0 ? 0 : 0.5) : 0;
        //TODO 非凸多边形需要缓存
        cmd.x = x + offset;
        cmd.y = y + offset;
        cmd.points = points;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.isConvexPolygon = tIsConvexPolygon;
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

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        this.points && context._drawPoly(this.x + gx, this.y + gy, this.points, this.fillColor, this.lineColor, this.lineWidth, this.isConvexPolygon, 0);
    }

    /**@private */
    get cmdID(): string {
        return DrawPolyCmd.ID;
    }
}

ClassUtils.regClass("DrawPolyCmd", DrawPolyCmd);