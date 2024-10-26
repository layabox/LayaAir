import { Context } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw a polygon
 * @zh 绘制多边形
 */
export class DrawPolyCmd {
    /**
     * @en Identifier for the DrawPolyCmd
     * @zh 绘制多边形命令的标识符
     */
    static ID: string = "DrawPoly";

    /**
     * @en The X-axis position to start drawing.
     * @zh 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * @en The Y-axis position to start drawing.
     * @zh 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * @en The collection of points for the polygon.
     * @zh 多边形的点集合。
     */
    points: number[] | null;
    /**
     * @en The fill color 
     * @zh 填充颜色 
     */
    fillColor: any;
    /**
     * @en (Optional) The border color  
     * @zh （可选）边框颜色 
     */
    lineColor: any;
    /**
     * @en (Optional) The width of the border.
     * @zh （可选）边框宽度。
     */
    lineWidth: number;

    /**
     * @en Create a DrawPolyCmd instance
     * @param x The X-axis position to start drawing
     * @param y The Y-axis position to start drawing
     * @param points The collection of points for the polygon
     * @param fillColor The fill color 
     * @param lineColor The border color 
     * @param lineWidth The width of the border
     * @returns DrawPolyCmd instance
     * @zh 创建绘制多边形命令的实例
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param points 多边形的点集合
     * @param fillColor 填充颜色 
     * @param lineColor 边框颜色 
     * @param lineWidth 边框宽度
     */
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
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.points = null;
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawPolyCmd", this);
    }

    /**
     * @en Execute the drawing polygon command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制多边形命令
     * @param context 渲染上下文
     * @param gx 全局 X 偏移
     * @param gy 全局 Y 偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let isConvexPolygon = this.points.length <= 6;
        let offset = (this.lineWidth >= 1 && this.lineColor) ? (this.lineWidth % 2 === 0 ? 0 : 0.5) : 0;
        this.points && context._drawPoly(this.x + offset + gx, this.y + offset + gy, this.points, this.fillColor, this.lineColor, this.lineWidth, isConvexPolygon, 0);
    }

    /**
     * @en The identifier for the DrawPolyCmd
     * @zh 绘制多边形命令的标识符
     */
    get cmdID(): string {
        return DrawPolyCmd.ID;
    }
}

ClassUtils.regClass("DrawPolyCmd", DrawPolyCmd);