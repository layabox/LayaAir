import { Context } from "../../resource/Context";
/**
 * 绘制扇形
 */
export declare class DrawPieCmd {
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
     * 扇形半径。
     */
    radius: number;
    private _startAngle;
    private _endAngle;
    /**
     * 填充颜色，或者填充绘图的渐变对象。
     */
    fillColor: any;
    /**
     * （可选）边框颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * （可选）边框宽度。
     */
    lineWidth: number;
    /**@private */
    vid: number;
    /**@private */
    static create(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): DrawPieCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
    /**
     * 开始角度。
     */
    startAngle: number;
    /**
     * 结束角度。
     */
    endAngle: number;
}
