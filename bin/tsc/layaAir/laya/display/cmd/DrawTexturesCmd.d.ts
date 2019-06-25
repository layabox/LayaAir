import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
/**
 * 根据坐标集合绘制多个贴图
 */
export declare class DrawTexturesCmd {
    static ID: string;
    /**
     * 纹理。
     */
    texture: Texture;
    /**
     * 绘制次数和坐标。
     */
    pos: any[];
    /**@private */
    static create(texture: Texture, pos: any[]): DrawTexturesCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
