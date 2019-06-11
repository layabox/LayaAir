import { Context } from "../../resource/Context";
/**
 * 存储命令，和restore配套使用
 */
export declare class SaveCmd {
    static ID: string;
    /**@private */
    static create(): SaveCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
