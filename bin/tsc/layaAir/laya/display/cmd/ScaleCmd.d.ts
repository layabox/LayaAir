import { Context } from "../../resource/Context";
/**
 * 缩放命令
 */
export declare class ScaleCmd {
    static ID: string;
    /**
     * 水平方向缩放值。
     */
    scaleX: number;
    /**
     * 垂直方向缩放值。
     */
    scaleY: number;
    /**
     * （可选）水平方向轴心点坐标。
     */
    pivotX: number;
    /**
     * （可选）垂直方向轴心点坐标。
     */
    pivotY: number;
    /**@private */
    static create(scaleX: number, scaleY: number, pivotX: number, pivotY: number): ScaleCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
