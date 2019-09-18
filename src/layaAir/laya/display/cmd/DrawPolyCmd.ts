import { Context } from "../../resource/Context"
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
    points: number[]|null;
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
    vid: number;

    /**@private */
    static create(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): DrawPolyCmd {
        var cmd: DrawPolyCmd = Pool.getItemByClass("DrawPolyCmd", DrawPolyCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.points = points;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.isConvexPolygon = isConvexPolygon;
        cmd.vid = vid;
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
        this.points && context._drawPoly(this.x + gx, this.y + gy, this.points, this.fillColor, this.lineColor, this.lineWidth, this.isConvexPolygon, this.vid);
    }

    /**@private */
    get cmdID(): string {
        return DrawPolyCmd.ID;
    }

}

