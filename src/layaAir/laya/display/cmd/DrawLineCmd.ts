import { Context, IGraphicCMD } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw bend line command
 * @zh 绘制单条曲线命令
 */
export class DrawLineCmd implements IGraphicCMD {
    /**
     * @en Identifier for the DrawLineCmd
     * @zh 绘制单条曲线命令的标识符
     */
    static ID: string = "DrawLine";

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
     * @private
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
     * @en Get the bounding points of the line
     * @param sp The sprite that draws the cmd
     * @returns An array of bounding points
     * @zh 获取直线的包围盒顶点数据
     * @param sp 绘制cmd的精灵
     * @returns 包围盒顶点数据数组
     */
    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        _tempPoints.length = 0;
        let lineWidth: number;
        lineWidth = this.lineWidth * 0.5;

        let fromX = this.fromX, fromY = this.fromY, toX = this.toX, toY = this.toY;
        if (this.percent) {
            fromX *= sp.width;
            fromY *= sp.height;
            toX *= sp.width;
            toY *= sp.height;
        }

        if (fromX == toX) {
            _tempPoints.push(fromX + lineWidth, fromY, toX + lineWidth, toY, fromX - lineWidth, fromY, toX - lineWidth, toY);
        } else if (fromY == toY) {
            _tempPoints.push(fromX, fromY + lineWidth, toX, toY + lineWidth, fromX, fromY - lineWidth, toX, toY - lineWidth);
        } else {
            _tempPoints.push(fromX, fromY, toX, toY);
        }

        return _tempPoints;
    }
}
const _tempPoints: any[] = [];

ClassUtils.regClass("DrawLineCmd", DrawLineCmd);