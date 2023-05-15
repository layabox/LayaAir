import { Context } from "../../resource/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * 绘制单条曲线
 */
export class DrawLineCmd {
    static ID: string = "DrawLine";

    /**
     * X轴开始位置。
     */
    fromX: number;
    /**
     * Y轴开始位置。
     */
    fromY: number;
    /**
     * X轴结束位置。
     */
    toX: number;
    /**
     * Y轴结束位置。
     */
    toY: number;
    /**
     * 颜色。
     */
    lineColor: string;
    /**
     * （可选）线条宽度。
     */
    lineWidth: number = 0;

    /**
     * 位置是否是百分比
     */
    percent: boolean;

    /**@private */
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
     * 回收到对象池
     */
    recover(): void {
        Pool.recover("DrawLineCmd", this);
    }

    /**@private */
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

    /**@private */
    get cmdID(): string {
        return DrawLineCmd.ID;
    }

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