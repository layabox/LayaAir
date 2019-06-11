import { Context } from "../../resource/Context";
/**
 * 绘制连续曲线
 */
export declare class DrawLinesCmd {
    static ID: string;
    /**
     * 开始绘制的X轴位置。
     */
    x: number;
    /**
     * 开始绘制的Y轴位置。
     */
    y: number;
    /**
     * 线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
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
    vid: number;
    /**@private */
    static create(x: number, y: number, points: any[], lineColor: any, lineWidth: number, vid: number): DrawLinesCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
