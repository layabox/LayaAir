import { Context } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";

/**
 * @en Draw bend line command
 * @zh 绘制单条曲线命令
 */
export class DrawLineCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the DrawLineCmd
     * @zh 绘制单条曲线命令的标识符
     */
    static readonly ID: string = "DrawLine";

    /**
     * @en X-axis start position
     * @zh X轴起始位置
     */
    fromX: number;
    /**
     * @en Y-axis start position
     * @zh Y轴起始位置
     */
    fromY: number;
    /**
     * @en X-axis end position
     * @zh X轴结束位置
     */
    toX: number;
    /**
     * @en Y-axis end position
     * @zh Y轴结束位置
     */
    toY: number;
    /**
     * @en Line color
     * @zh 线条颜色
     */
    lineColor: string;
    /**
     * @en (Optional) Line width
     * @zh （可选）线条宽度
     */
    lineWidth: number = 0;

    /**
     * @en Whether the position is a percentage
     * @zh 位置是否是百分比
     */
    percent: boolean;

    /**
     * @en Create a DrawLineCmd instance
     * @param fromX X-axis start position
     * @param fromY Y-axis start position
     * @param toX X-axis end position
     * @param toY Y-axis end position
     * @param lineColor Line color
     * @param lineWidth Line width
     * @returns A DrawLineCmd instance
     * @zh 创建一个绘制单条曲线命令实例
     * @param fromX X轴起始位置
     * @param fromY Y轴起始位置
     * @param toX X轴结束位置
     * @param toY Y轴结束位置
     * @param lineColor 线条颜色
     * @param lineWidth 线条宽度
     * @returns DrawLineCmd 实例
     */
    static create(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number): DrawLineCmd {
        var cmd: DrawLineCmd = Pool.getItemByClass("DrawLineCmd", DrawLineCmd);
        cmd.fromX = fromX;
        cmd.fromY = fromY;
        cmd.toX = toX;
        cmd.toY = toY;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }

    /**
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        Pool.recover("DrawLineCmd", this);
    }

    /**
     * @en Execute the draw bend line command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制单条曲线命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth < 1 || this.lineWidth % 2 === 0) ? 0 : 0.5;
        if (this.percent && context.sprite) {
            let w = context.sprite.width;
            let h = context.sprite.height;
            context._drawLine(gx, gy, this.fromX * w + offset, this.fromY * h + offset, this.toX * w + offset, this.toY * h + offset, this.lineColor, this.lineWidth, 0);
        }
        else
            context._drawLine(gx, gy, this.fromX + offset, this.fromY + offset, this.toX + offset, this.toY + offset, this.lineColor, this.lineWidth, 0);
    }


    /**
     * @en The identifier for the DrawLineCmd
     * @zh 绘制单条曲线命令的标识符
     */
    get cmdID(): string {
        return DrawLineCmd.ID;
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        let lineWidth: number;
        lineWidth = this.lineWidth * 0.5;

        let fromX = this.fromX, fromY = this.fromY, toX = this.toX, toY = this.toY;
        if (this.percent) {
            fromX *= assembler.width;
            fromY *= assembler.height;
            toX *= assembler.width;
            toY *= assembler.height;

            assembler.affectBySize = true;
        }

        if (fromX == toX) {
            assembler.points.push(fromX + lineWidth, fromY, toX + lineWidth, toY, fromX - lineWidth, fromY, toX - lineWidth, toY);
        } else if (fromY == toY) {
            assembler.points.push(fromX, fromY + lineWidth, toX, toY + lineWidth, fromX, fromY - lineWidth, toX, toY - lineWidth);
        } else {
            assembler.points.push(fromX, fromY, toX, toY);
        }
    }
}

ClassUtils.regClass("DrawLineCmd", DrawLineCmd);