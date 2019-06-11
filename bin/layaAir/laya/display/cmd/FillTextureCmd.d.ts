import { Point } from "../../maths/Point";
import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
/**
 * 填充贴图
 */
export declare class FillTextureCmd {
    static ID: string;
    /**
     * 纹理。
     */
    texture: Texture;
    /**
     * X轴偏移量。
     */
    x: number;
    /**
     * Y轴偏移量。
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
    /**
     * （可选）填充类型 repeat|repeat-x|repeat-y|no-repeat
     */
    type: string;
    /**
     * （可选）贴图纹理偏移
     */
    offset: Point;
    /**@private */
    other: any;
    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, other: any): FillTextureCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
