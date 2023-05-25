import { ColorFilter } from "../../filters/ColorFilter"
import { Matrix } from "../../maths/Matrix"
import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from '../../utils/ColorUtils';
import { Pool } from "../../utils/Pool";

/**
 * 绘制单个贴图
 */
export class DrawTextureCmd {
    static ID: string = "DrawTexture";

    /**
     * 纹理。
     */
    texture: Texture | null;
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
    matrix: Matrix | null;
    /**
     * （可选）透明度。
     */
    alpha: number;
    /**
     * （可选）颜色滤镜。
     */
    color: number = 0xffffffff;
    /**
     * （可选）混合模式。
     */
    blendMode: string | null;

    uv: number[] | null = null;

    /**@private */
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
     * 回收到对象池
     */
    recover(): void {
        this.texture && this.texture._removeReference();
        this.texture = null;
        this.matrix = null;
        Pool.recover("DrawTextureCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        this.texture && context.drawTextureWithTransform(this.texture, this.x, this.y, this.width, this.height, this.matrix, gx, gy, this.alpha, this.blendMode, this.uv, this.color);
    }

    /**@private */
    get cmdID(): string {
        return DrawTextureCmd.ID;
    }
}

ClassUtils.regClass("DrawTextureCmd", DrawTextureCmd);
