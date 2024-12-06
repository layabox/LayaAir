import { ColorFilter } from "../../filters/ColorFilter"
import { Matrix } from "../../maths/Matrix"
import { Context } from "../../renders/Context"
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from '../../utils/ColorUtils';
import { Pool } from "../../utils/Pool";

/**
 * @en Draw a single texture
 * @zh 绘制单个贴图
 */
export class DrawTextureCmd {
    /**
     * @en Identifier for the DrawTextureCmd
     * @zh 绘制单个贴图命令的标识符
     */
    static ID: string = "DrawTexture";

    /**
     * @en The texture to be drawn.
     * @zh 要绘制的纹理。
     */
    texture: Texture | null;
    /**
     * @en (Optional) X-axis offset.
     * @zh （可选）X轴偏移量。
     */
    x: number;
    /**
     * @en (Optional) Y-axis offset.
     * @zh （可选）Y轴偏移量。
     */
    y: number;
    /**
     * @en (Optional) Width of the texture.
     * @zh （可选）纹理的宽度。
     */
    width: number;
    /**
     * @en (Optional) Height of the texture.
     * @zh （可选）纹理的高度。
     */
    height: number;
    /**
     * @en (Optional) Matrix information for transformation.
     * @zh （可选）矩阵信息，用于变换。
     */
    matrix: Matrix | null;
    /**
     * @en (Optional) Alpha value.
     * @zh （可选）透明度。
     */
    alpha: number;
    /**
     * @en (Optional) Color filter.
     * @zh （可选）颜色滤镜。
     */
    color: number = 0xffffffff;
    /**
     * @en (Optional) Blend mode.
     * @zh （可选）混合模式。
     */
    blendMode: string | null;

    /**
     * @en (Optional) UV coordinates.
     * @zh （可选）UV坐标。
     */
    uv: number[] | null = null;

    /**
     * @en Create a DrawTextureCmd instance
     * @param texture The texture to be drawn
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param width Width of the texture
     * @param height Height of the texture
     * @param matrix Matrix information for transformation
     * @param alpha Alpha value
     * @param color Color filter
     * @param blendMode Blend mode
     * @param uv UV coordinates
     * @returns DrawTextureCmd instance
     * @zh 创建一个绘制单个贴图实例
     * @param texture 要绘制的纹理
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width 纹理的宽度
     * @param height 纹理的高度
     * @param matrix 矩阵信息，用于变换
     * @param alpha 透明度
     * @param color 颜色滤镜
     * @param blendMode 混合模式
     * @param uv UV坐标
     * @returns DrawTextureCmd实例
     */
    static create(texture: Texture, x: number, y: number, width: number, height: number, matrix: Matrix | null, alpha: number, color: string | null, blendMode: string | null, uv?: number[]): DrawTextureCmd {
        if (width == null) width = texture.sourceWidth;
        if (height == null) height = texture.sourceHeight;

        let wRate = width / texture.sourceWidth;
        let hRate = height / texture.sourceHeight;
        width = texture.width * wRate;
        height = texture.height * hRate;

        x += texture.offsetX * wRate;
        y += texture.offsetY * hRate;

        var cmd: DrawTextureCmd = Pool.getItemByClass("DrawTextureCmd", DrawTextureCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.matrix = matrix;
        cmd.alpha = alpha;
        cmd.blendMode = blendMode;
        cmd.uv = uv || null;
        cmd.color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.texture && this.texture._removeReference();
        this.texture = null;
        this.matrix = null;
        Pool.recover("DrawTextureCmd", this);
    }

    /**
     * @en Execute the draw texture command.
     * @param context The rendering context.
     * @param gx Starting X coordinate.
     * @param gy Starting Y coordinate.
     * @zh 执行绘制纹理命令。
     * @param context 渲染上下文。
     * @param gx 起始 X 坐标。
     * @param gy 起始 Y 坐标。
     */

    run(context: Context, gx: number, gy: number): void {
        this.texture && context.drawTextureWithTransform(this.texture, this.x, this.y, this.width, this.height, this.matrix, gx, gy, this.alpha, this.blendMode, this.uv, this.color);
    }

    /**
     * @en The identifier for the DrawTextureCmd
     * @zh 绘制单个贴图命令的标识符
     */
    get cmdID(): string {
        return DrawTextureCmd.ID;
    }
}

ClassUtils.regClass("DrawTextureCmd", DrawTextureCmd);
