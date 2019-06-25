import { Context } from "../../resource/Context";
/**
 * 位移命令
 */
export declare class TranslateCmd {
    static ID: string;
    /**
     * 添加到水平坐标（x）上的值。
     */
    tx: number;
    /**
     * 添加到垂直坐标（y）上的值。
     */
    ty: number;
    /**@private */
    static create(tx: number, ty: number): TranslateCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
