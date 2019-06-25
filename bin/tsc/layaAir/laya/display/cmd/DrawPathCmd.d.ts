import { Context } from "../../resource/Context";
/**
 * 根据路径绘制矢量图形
 */
export declare class DrawPathCmd {
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
     * 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
     */
    paths: any[];
    /**
     * （可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
     */
    brush: any;
    /**
     * （可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
     */
    pen: any;
    /**@private */
    static create(x: number, y: number, paths: any[], brush: any, pen: any): DrawPathCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
