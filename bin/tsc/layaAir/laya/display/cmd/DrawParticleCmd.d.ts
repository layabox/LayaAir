import { Context } from "../../resource/Context";
/**
 * 绘制粒子
 * @private
 */
export declare class DrawParticleCmd {
    static ID: string;
    private _templ;
    /**@private */
    static create(_temp: any): DrawParticleCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
