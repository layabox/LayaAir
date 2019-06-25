import { Context } from "../../resource/Context";
/**
 * 绘制曲线
 */
export declare class DrawCurvesCmd {
    static ID: string;
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
    points: any[];
    /**
     * 线段颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * （可选）线段宽度。
     */
    lineWidth: number;
    /**@private */
    static create(x: number, y: number, points: any[], lineColor: any, lineWidth: number): DrawCurvesCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
