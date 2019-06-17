import { Context } from "../../resource/Context";
/**
 * 恢复命令，和save配套使用
 */
export declare class RestoreCmd {
    static ID: string;
    /**@private */
    static create(): RestoreCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
