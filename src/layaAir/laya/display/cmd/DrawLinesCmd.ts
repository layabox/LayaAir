import { Context, IGraphicCMD } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw continuous curves command
 * @zh 绘制连续曲线命令
 */
export class DrawLinesCmd implements IGraphicCMD {
    /**
     * @en Identifier for the DrawLinesCmd
     * @zh 绘制连续曲线命令的标识符
     */
    static ID: string = "DrawLines";

    /**
     * @en X-axis position to start drawing
     * @zh 开始绘制的X轴位置
     */
    x: number;
    /**
     * @en Y-axis position to start drawing
     * @zh 开始绘制的Y轴位置
     */
    y: number;
    /**
     * @en Collection of points for the line segments. Format: [x1,y1,x2,y2,x3,y3...]
     * @zh 线段的点集合。格式：[x1,y1,x2,y2,x3,y3...]
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
    lineWidth: number = 0;

    /**
     * @en Create a DrawLinesCmd instance
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param points Collection of points for the line segments
     * @param lineColor Line color
     * @param lineWidth Line width
     * @returns A DrawLinesCmd instance
     * @zh 创建一个绘制连续曲线命令实例
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param points 线段的点集合
     * @param lineColor 线段颜色
     * @param lineWidth 线段宽度
     * @returns DrawLinesCmd 实例
     */
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
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        this.points = null;
        this.lineColor = null;
        Pool.recover("DrawLinesCmd", this);
    }

    /**
     * @en Execute the draw continuous lines command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制连续曲线命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth < 1 || this.lineWidth % 2 === 0) ? 0 : 0.5;
        this.points && context._drawLines(this.x + offset + gx, this.y + offset + gy, this.points, this.lineColor, this.lineWidth, 0);
    }

    /**
     * @en The identifier for the DrawLinesCmd
     * @zh 绘制连续曲线命令的标识符
     */
    get cmdID(): string {
        return DrawLinesCmd.ID;
    }

}

ClassUtils.regClass("DrawLinesCmd", DrawLinesCmd);