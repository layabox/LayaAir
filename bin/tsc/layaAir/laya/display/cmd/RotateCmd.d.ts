import { Context } from "../../resource/Context";
/**
 * 旋转命令
 */
export declare class RotateCmd {
    static ID: string;
    /**
     * 旋转角度，以弧度计。
     */
    angle: number;
    /**
     * （可选）水平方向轴心点坐标。
     */
    pivotX: number;
    /**
     * （可选）垂直方向轴心点坐标。
     */
    pivotY: number;
    /**@private */
    static create(angle: number, pivotX: number, pivotY: number): RotateCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
