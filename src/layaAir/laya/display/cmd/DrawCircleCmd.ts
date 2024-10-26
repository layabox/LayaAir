import { Rectangle } from "../../maths/Rectangle";
import { Context, IGraphicCMD } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw circle command
 * @zh 绘制圆形命令
 */
export class DrawCircleCmd implements IGraphicCMD {
    /**
     * @en Identifier for the DrawCircleCmd
     * @zh 绘制圆形命令的标识符
     */
    static ID: string = "DrawCircle";

    /**
     * @en X-axis position of the circle center
     * @zh 圆心X轴位置
     */
    x: number;
    /**
     * @en Y-axis position of the circle center
     * @zh 圆心Y轴位置
     */
    y: number;
    /**
     * @en Radius of the circle
     * @zh 圆的半径
     */
    radius: number;
    /**
     * @en Fill color
     * @zh 填充颜色
     */
    fillColor: any;
    /**
     * @en (Optional) Border color
     * @zh （可选）边框颜色
     */
    lineColor: any;
    /**
     * @en (Optional) Border width
     * @zh （可选）边框宽度
     */
    lineWidth: number = 0;

    /**
     * @en Whether the position and size are percentages
     * @zh 位置和大小是否是百分比
     */
    percent: boolean;

    /**
     * @private
     * @en Create a DrawCircleCmd instance
     * @param x X-axis position of the circle center
     * @param y Y-axis position of the circle center
     * @param radius Radius of the circle
     * @param fillColor Fill color
     * @param lineColor Border color
     * @param lineWidth Border width
     * @returns A DrawCircleCmd instance
     * @zh 创建绘制圆形的DrawCircleCmd实例
     * @param x 圆心X轴位置
     * @param y 圆心Y轴位置
     * @param radius 圆的半径
     * @param fillColor 填充颜色
     * @param lineColor 边框颜色
     * @param lineWidth 边框宽度
     * @returns DrawCircleCmd实例
     */
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
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawCircleCmd", this);
    }

    /**
     * @en Execute the draw circle command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制圆形命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context._drawCircle(this.x * w + gx, this.y * h + gy, this.radius * Math.min(w, h) - offset, this.fillColor, this.lineColor, this.lineWidth, 0);
        }
        else
            context._drawCircle(this.x + gx, this.y + gy, this.radius - offset, this.fillColor, this.lineColor, this.lineWidth, 0);
    }

    /**
     * @en The identifier for the DrawCircleCmd
     * @zh 绘制圆形命令的标识符
     */
    get cmdID(): string {
        return DrawCircleCmd.ID;
    }

    /**
     * @en Get the bounding points of the circle
     * @param sp The sprite that draws the cmd
     * @returns An array of bounding points
     * @zh 获取圆形的包围盒顶点数据
     * @param sp 绘制cmd的精灵
     * @returns 包围盒顶点数据数组
     */
    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        return Rectangle._getBoundPointS(this.x - this.radius, this.y - this.radius, this.radius + this.radius, this.radius + this.radius, this.percent ? sp : null);
    }
}

ClassUtils.regClass("DrawCircleCmd", DrawCircleCmd);
