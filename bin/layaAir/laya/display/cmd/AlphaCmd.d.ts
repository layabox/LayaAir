import { Context } from "../../resource/Context";
/**
 * 透明命令
 */
export declare class AlphaCmd {
    static ID: string;
    /**
     * 透明度
     */
    alpha: number;
    /**@private */
    static create(alpha: number): AlphaCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
