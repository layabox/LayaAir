import { Rectangle } from "../../maths/Rectangle";
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";

const className = "DrawCircleCmd";

/**
 * @en Draw circle command
 * @zh 绘制圆形命令
 */
export class DrawCircleCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the DrawCircleCmd
     * @zh 绘制圆形命令的标识符
     */
    static readonly ID: string = className;

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
     * @param percent 位置和大小是否是百分比值
     * @returns DrawCircleCmd实例
     */
    static create(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawCircleCmd {
        var cmd: DrawCircleCmd = Pool.getItemByClass(className, DrawCircleCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.percent = percent;
        return cmd;
    }

    /**
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover(className, this);
    }

    /**
     * @en Execute the draw circle command
     * @param runner The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制圆形命令
     * @param runner 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        if (this.percent && runner.sprite) {
            let w = runner.sprite.width;
            let h = runner.sprite.height;
            runner._drawCircle(this.x * w + gx, this.y * h + gy, this.radius * Math.min(w, h) - offset, this.fillColor, this.lineColor, this.lineWidth, 0);
        }
        else
            runner._drawCircle(this.x + gx, this.y + gy, this.radius - offset, this.fillColor, this.lineColor, this.lineWidth, 0);
    }

    /**
     * @en The identifier for the DrawCircleCmd
     * @zh 绘制圆形命令的标识符
     */
    get cmdID(): string {
        return DrawCircleCmd.ID;
    }

    /**
     * @en Returns 1 if percent is true, otherwise returns 0.
     * @zh 如果percent为true返回1，否则返回0。
     */
    needsLayoutRepaint(): number {
        return 1;
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        let rect = Rectangle.TEMP.setTo(this.x - this.radius, this.y - this.radius, this.radius + this.radius, this.radius + this.radius)
        if (this.percent) {
            rect.scale(assembler.width, assembler.height);
        }
        rect.getBoundPoints(assembler.points);
    }
}

ClassUtils.regClass(className, DrawCircleCmd);
