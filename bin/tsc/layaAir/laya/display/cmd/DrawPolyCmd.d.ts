import { Context } from "../../resource/Context";
/**
 * 绘制多边形
 */
export declare class DrawPolyCmd {
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
     * 多边形的点集合。
     */
    points: any[];
    /**
     * 填充颜色，或者填充绘图的渐变对象。
     */
    fillColor: any;
    /**
     * （可选）边框颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * 可选）边框宽度。
     */
    lineWidth: number;
    /**@private */
    isConvexPolygon: boolean;
    /**@private */
    vid: number;
    /**@private */
    static create(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): DrawPolyCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
