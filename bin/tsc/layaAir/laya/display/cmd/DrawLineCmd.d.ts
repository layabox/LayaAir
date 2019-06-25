import { Context } from "../../resource/Context";
/**
 * 绘制单条曲线
 */
export declare class DrawLineCmd {
    static ID: string;
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
    lineWidth: number;
    /**@private */
    vid: number;
    /**@private */
    static create(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number, vid: number): DrawLineCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
