import { Rectangle } from "../../maths/Rectangle";
import { Context, IGraphicCMD } from "../../renders/Context";
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool";

/**
 * @en Draw ellipse command
 * @zh 绘制椭圆命令
 */
export class DrawEllipseCmd implements IGraphicCMD {
    /**
     * @en Identifier for the DrawEllipseCmd
     * @zh 绘制椭圆命令的标识符
     */
    static ID: string = "DrawEllipse";
    /**
     * @en X-axis position of the ellipse center
     * @zh 椭圆中心点X轴位置
     */
    x: number;
    /**
     * @en Y-axis position of the ellipse center
     * @zh 椭圆中心点Y轴位置
     */
    y: number;
    /**
     * @en Horizontal radius of the ellipse
     * @zh 椭圆的横向半径
     */
    width: number;
    /**
     * @en Vertical radius of the ellipse
     * @zh 椭圆的纵向半径
     */
    height: number;
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
     * @en Create a DrawEllipseCmd instance
     * @param x X-axis position of the ellipse center
     * @param y Y-axis position of the ellipse center
     * @param width Horizontal radius of the ellipse
     * @param height Vertical radius of the ellipse
     * @param fillColor Fill color
     * @param lineColor Border color
     * @param lineWidth Border width
     * @param percent Whether the position and size are percentages
     * @returns A DrawEllipseCmd instance
     * @zh 创建一个绘制椭圆命令的实例
     * @param x 椭圆中心点X轴位置
     * @param y 椭圆中心点Y轴位置
     * @param width 椭圆的横向半径
     * @param height 椭圆的纵向半径
     * @param fillColor 填充颜色
     * @param lineColor 边框颜色
     * @param lineWidth 边框宽度
     * @param percent 位置和大小是否是百分比
     * @returns DrawEllipseCmd实例
     */
    static create(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawEllipseCmd {
        var cmd = Pool.getItemByClass("DrawEllipseCmd", DrawEllipseCmd);
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
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawEllipseCmd", this);
    }

    /**
     * @private
     * @en Execute the draw ellipse command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制椭圆命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context._drawEllipse(this.x * w + gx, this.y * h + gy, this.width * w - offset, this.height * h - offset, this.fillColor, this.lineColor, this.lineWidth);
        }
        else {
            context._drawEllipse(this.x + gx, this.y + gy, this.width - offset, this.height - offset, this.fillColor, this.lineColor, this.lineWidth);
        }
    }

    /**
     * @private
     * @en The identifier for the DrawEllipseCmd
     * @zh 绘制椭圆命令的标识符
     */
    get cmdID(): string {
        return DrawEllipseCmd.ID;
    }

    /**
     * @en Get the bounding points of the ellipse
     * @param sp The sprite that draws the cmd
     * @returns An array of bounding points
     * @zh 获取椭圆的包围盒顶点数据
     * @param sp 绘制cmd的精灵
     * @returns 包围盒顶点数据数组
     */
    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        return Rectangle._getBoundPointS(this.x - this.width, this.y - this.height, this.width * 2, this.height * 2, this.percent ? sp : null);
    }

}

ClassUtils.regClass("DrawEllipseCmd", DrawEllipseCmd);