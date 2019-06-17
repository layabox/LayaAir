import { ColorFilter } from "../../filters/ColorFilter";
import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
import { Texture } from "../../resource/Texture";
/**
 * 绘制单个贴图
 */
export declare class DrawTextureCmd {
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
    /**
     * （可选）矩阵信息。
     */
    matrix: Matrix;
    /**
     * （可选）透明度。
     */
    alpha: number;
    /**
     * （可选）颜色滤镜。
     */
    color: string;
    colorFlt: ColorFilter;
    /**
     * （可选）混合模式。
     */
    blendMode: string;
    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number, matrix: Matrix, alpha: number, color: string, blendMode: string): DrawTextureCmd;
    /**
     * 回收到对象池
     */
    recover(): void;
    /**@private */
    run(context: Context, gx: number, gy: number): void;
    /**@private */
    readonly cmdID: string;
}
