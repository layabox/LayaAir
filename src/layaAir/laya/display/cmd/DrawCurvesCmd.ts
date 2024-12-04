import { Bezier } from "../../maths/Bezier";
import { Context, IGraphicCMD } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw curves command
 * @zh 绘制曲线命令
 */
export class DrawCurvesCmd implements IGraphicCMD {
    /**
     * @en Identifier for the DrawCurvesCmd
     * @zh 绘制曲线命令的标识符
     */
    static ID: string = "DrawCurves";

    /**
     * @en X-axis position to start drawing
     * @zh 开始绘制的 X 轴位置
     */
    x: number;
    /**
     * @en Y-axis position to start drawing
     * @zh 开始绘制的 Y 轴位置
     */
    y: number;
    /**
     * @en Collection of points for the curve segments, format: [controlX, controlY, anchorX, anchorY...]
     * @zh 线段的点集合，格式：[controlX, controlY, anchorX, anchorY...]
     */
    points: number[] | null;
    /**
     * @en Line color
     * @zh 线段颜色
     */
    lineColor: any;
    /**
     * @en (Optional) Line width
     * @zh （可选）线段宽度
     */
    lineWidth: number;

    /**
     * @private
     * @en Create a DrawCurvesCmd instance
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param points Collection of points for the curve segments
     * @param lineColor Line color
     * @param lineWidth Line width
     * @returns A DrawCurvesCmd instance
     * @zh 创建一个DrawCurvesCmd实例
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param points 线段的点集合
     * @param lineColor 线段颜色
     * @param lineWidth 线段宽度
     * @returns DrawCurvesCmd实例
     */
    static create(x: number, y: number, points: any[], lineColor: any, lineWidth: number): DrawCurvesCmd {
        var cmd: DrawCurvesCmd = Pool.getItemByClass("DrawCurvesCmd", DrawCurvesCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.points = points;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }

    /**
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        this.points = null;
        this.lineColor = null;
        Pool.recover("DrawCurvesCmd", this);
    }

    /**
     * @en Execute the draw curves command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制曲线命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        if (this.points)
            context.drawCurves(this.x + gx, this.y + gy, this.points, this.lineColor, this.lineWidth);
    }

    /**
     * @en The identifier for the DrawCurvesCmd
     * @zh 绘制曲线命令的标识符
     */
    get cmdID(): string {
        return DrawCurvesCmd.ID;
    }

    /**
     * @en Get the bounding points of the curves.
     * @zh 获取贝塞尔曲线上的点数据。
     */
    getBoundPoints(): number[] {
        return Bezier.I.getBezierPoints(this.points);
    }
}

ClassUtils.regClass("DrawCurvesCmd", DrawCurvesCmd);