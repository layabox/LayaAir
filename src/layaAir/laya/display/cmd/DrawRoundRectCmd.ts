import { Rectangle } from "../../maths/Rectangle";
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool";
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";

/**
 * @en Draw a rounded rectangle
 * @zh 绘制圆角矩形
 */
export class DrawRoundRectCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the DrawRoundRectCmd
     * @zh 绘制圆角矩形命令的标识符
     */
    static ID: string = "DrawRoundRect";
    /**
     * @en The X-axis position of the rounded rectangle.
     * @zh 圆角矩形的 X 轴位置。
     */
    x: number = 0;
    /**
     * @en The Y-axis position of the rounded rectangle.
     * @zh 圆角矩形的 Y 轴位置。
     */
    y: number = 0;
    /**
     * @en The width of the rounded rectangle.
     * @zh 圆角矩形的宽度。
     */
    width: number = 1;
    /**
     * @en The height of the rounded rectangle.
     * @zh 圆角矩形的高度。
     */
    height: number = 1;
    /**
     * @en The radius of the top-left corner.
     * @zh 左上圆角的半径。
     */
    lt: number = 6;
    /**
     * @en The radius of the top-right corner.
     * @zh 右上圆角的半径。
     */
    rt: number = 6;
    /**
     * @en The radius of the bottom-left corner.
     * @zh 左下圆角的半径。
     */
    lb: number = 6;
    /**
     * @en The radius of the bottom-right corner.
     * @zh 右下圆角的半径。
     */
    rb: number = 6;
    /**
     * @en The fill color.
     * @zh 填充颜色 
     */
    fillColor: any;
    /**
     * @en (Optional) The border color.
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
    percent: boolean = true;


    /**
     * @en Create a DrawRoundRectCmd instance
     * @param x The X-axis position of the rounded rectangle
     * @param y The Y-axis position of the rounded rectangle
     * @param width The width of the rounded rectangle
     * @param height The height of the rounded rectangle
     * @param lt The radius of the top-left corner
     * @param rt The radius of the top-right corner
     * @param lb The radius of the bottom-left corner
     * @param rb The radius of the bottom-right corner
     * @param fillColor The fill color 
     * @param lineColor The border color 
     * @param lineWidth The width of the border
     * @param percent Whether the position and size are percentages
     * @returns DrawRoundRectCmd instance
     * @zh 创建绘制圆角矩形命令的实例
     * @param x 圆角矩形的 X 轴位置
     * @param y 圆角矩形的 Y 轴位置
     * @param width 圆角矩形的宽度
     * @param height 圆角矩形的高度
     * @param lt 左上圆角的半径
     * @param rt 右上圆角的半径
     * @param lb 左下圆角的半径
     * @param rb 右下圆角的半径
     * @param fillColor 填充颜色 
     * @param lineColor 边框颜色 
     * @param lineWidth 边框宽度
     * @param percent 位置和大小是否是百分比
     * @returns DrawRoundRectCmd 实例
     */
    static create(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawRoundRectCmd {
        var cmd = Pool.getItemByClass("DrawRoundRectCmd", DrawRoundRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.lt = lt;
        cmd.rt = rt;
        cmd.lb = lb;
        cmd.rb = rb;
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
        Pool.recover("DrawRoundRectCmd", this);
    }

    /**
     * @en Execute the drawing rounded rectangle command
     * @param runner The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制圆角矩形命令
     * @param runner 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        let lineOffset = this.lineColor ? this.lineWidth : 0;
        if (this.percent && runner.sprite) {
            let w = runner.sprite.width;
            let h = runner.sprite.height;
            runner._drawRoundRect(this.x * w + offset + gx, this.y * h + offset + gy, this.width * w - lineOffset, this.height * h - lineOffset, this.lt, this.rt, this.lb, this.rb, this.fillColor, this.lineColor, this.lineWidth);
        }
        else {
            runner._drawRoundRect(this.x + offset + gx, this.y + offset + gy, this.width - lineOffset, this.height - lineOffset, this.lt, this.rt, this.lb, this.rb, this.fillColor, this.lineColor, this.lineWidth);
        }
    }

    /**
     * @en The identifier for the DrawRoundRectCmd
     * @zh 绘制圆角矩形命令的标识符
     */
    get cmdID(): string {
        return DrawRoundRectCmd.ID;
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        let rect = Rectangle.TEMP.setTo(this.x, this.y, this.width, this.height);
        if (this) {
            rect.scale(assembler.width, assembler.height);
            assembler.affectBySize = true;
        }
        rect.getBoundPoints(assembler.points);
    }

}

ClassUtils.regClass("DrawRoundRectCmd", DrawRoundRectCmd);