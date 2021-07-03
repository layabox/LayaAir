import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 绘制曲线
 */
export class DrawCurvesCmd {
    static ID: string = "DrawCurves";

    /**
     * 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * 线段的点集合，格式[controlX, controlY, anchorX, anchorY...]。
     */
    points: number[]|null;
    /**
     * 线段颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * （可选）线段宽度。
     */
    lineWidth: number;

    /**@private */
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
     * 回收到对象池
     */
    recover(): void {
        this.points = null;
        this.lineColor = null;
        Pool.recover("DrawCurvesCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
		if(this.points)
        	context.drawCurves(this.x + gx, this.y + gy, this.points, this.lineColor, this.lineWidth);
    }

    /**@private */
    get cmdID(): string {
        return DrawCurvesCmd.ID;
    }

}

