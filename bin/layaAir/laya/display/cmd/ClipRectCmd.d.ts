import { Context } from "../../resource/Context";
/**
 * 裁剪命令
 */
export declare class ClipRectCmd {
    static ID: string;
    /**
     * X 轴偏移量。
     */
    x: number;
    /**
     * Y 轴偏移量。
     */
    y: number;
    /**
     * 宽度。
     */
    width: number;
    /**
     * 高度。
     */
    height: number;
    /**@private */
    static create(x: number, y: number, width: number, height: number): ClipRectCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
