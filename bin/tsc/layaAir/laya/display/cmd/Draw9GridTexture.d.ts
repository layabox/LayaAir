import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
/**
 * 绘制带九宫格信息的图片
 * @private
 */
export declare class Draw9GridTexture {
    static ID: string;
    /**
     * 纹理。
     */
    texture: Texture;
    /**
     * （可选）X轴偏移量。
     */
    x: number;
    /**
     * （可选）Y轴偏移量。
     */
    y: number;
    /**
     * （可选）宽度。
     */
    width: number;
    /**
     * （可选）高度。
     */
    height: number;
    sizeGrid: any[];
    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number, sizeGrid: any[]): Draw9GridTexture;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
    constructor();
}
