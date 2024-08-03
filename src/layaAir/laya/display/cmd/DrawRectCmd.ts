import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw a rectangle
 * @zh 绘制矩形
 */
export class DrawRectCmd {
    /**
     * @en Identifier for the DrawRectCmd
     * @zh 绘制矩形命令的标识符
     */
    static ID: string = "DrawRect";

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
     * @en The width of the rectangle.
     * @zh 矩形宽度。
     */
    width: number;
    /**
     * @en The height of the rectangle.
     * @zh 矩形高度。
     */
    height: number;
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
    lineWidth: number = 0;

    /**
     * @en Whether the position and size are percentages.
     * @zh 位置和大小是否是百分比。
     */
    percent: boolean;

    /**
     * @private
     * @en Create a DrawRectCmd instance
     * @param x The X-axis position to start drawing
     * @param y The Y-axis position to start drawing
     * @param width The width of the rectangle
     * @param height The height of the rectangle
     * @param fillColor The fill color 
     * @param lineColor The border color 
     * @param lineWidth The width of the border
     * @param percent Whether the position and size are percentages
     * @returns DrawRectCmd instance
     * @zh 创建绘制矩形的命令实例
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param width 矩形宽度
     * @param height 矩形高度
     * @param fillColor 填充颜色 
     * @param lineColor 边框颜色 
     * @param lineWidth 边框宽度
     * @param percent 位置和大小是否是百分比
     * @returns DrawRectCmd实例
     */
    static create(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawRectCmd {
        var cmd: DrawRectCmd = Pool.getItemByClass("DrawRectCmd", DrawRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.percent = percent;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawRectCmd", this);
    }

    /**
     * @private
     * @en Execute the drawing rectangle command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制矩形命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        let lineOffset = this.lineColor ? this.lineWidth : 0;
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context.drawRect(this.x * w + offset + gx, this.y * h + offset + gy, this.width * w - lineOffset, this.height * h - lineOffset, this.fillColor, this.lineColor, this.lineWidth);
        }
        else
            context.drawRect(this.x + offset + gx, this.y + offset + gy, this.width - lineOffset, this.height - lineOffset, this.fillColor, this.lineColor, this.lineWidth);
    }

    /**
     * @private
     * @en The identifier for the DrawRectCmd
     * @zh 绘制矩形命令的标识符
     */
    get cmdID(): string {
        return DrawRectCmd.ID;
    }

    /**
     * @en Get the vertex data of the bounding box
     * @param sp The sprite that draws the command
     * @returns Array of vertex data
     * @zh 获取包围盒的顶点数据
     * @param sp 绘制命令的精灵对象
     * @returns 顶点数据数组
     */
    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        return Rectangle._getBoundPointS(this.x, this.y, this.width, this.height, this.percent ? sp : null)
    }
}

ClassUtils.regClass("DrawRectCmd", DrawRectCmd);

