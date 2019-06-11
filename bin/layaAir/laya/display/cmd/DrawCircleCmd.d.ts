import { Context } from "../../resource/Context";
/**
 * 绘制圆形
 */
export declare class DrawCircleCmd {
    static ID: string;
    /**
     * 圆点X 轴位置。
     */
    x: number;
    /**
     * 圆点Y 轴位置。
     */
    y: number;
    /**
     * 半径。
     */
    radius: number;
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
    static create(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): DrawCircleCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
