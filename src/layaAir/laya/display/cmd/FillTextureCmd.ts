import { Point } from "../../maths/Point"
import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../renders/Context"
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from "../../utils/ColorUtils";
import { Pool } from "../../utils/Pool";

/**
 * @en Fill texture command
 * @zh 填充贴图命令
 */
export class FillTextureCmd {
    /**
     * @en Identifier for the FillTextureCmd
     * @zh 填充贴图命令的标识符
     */
    static ID: string = "FillTexture";

    /**
     * @en The texture to be filled.
     * @zh 要填充的纹理。
     */
    texture: Texture;
    /**
     * @en X-axis offset.
     * @zh X轴偏移量。
     */
    x: number;
    /**
     * @en Y-axis offset.
     * @zh Y轴偏移量。
     */
    y: number;
    /**
     * @en (Optional) Width of the filled area.
     * @zh （可选）填充区域的宽度。
     */
    width: number;
    /**
     * @en (Optional) Height of the filled area.
     * @zh （可选）填充区域的高度。
     */
    height: number;
    /**
     * @en (Optional) Fill type: repeat|repeat-x|repeat-y|no-repeat
     * @zh （可选）填充类型：repeat|repeat-x|repeat-y|no-repeat
     */
    type?: string;
    /**
     * @en (Optional) Texture offset
     * @zh （可选）贴图纹理偏移
     */
    offset?: Point;

    /**
     * @en Whether the position and size are percentages
     * @zh 位置和大小是否是百分比
     */
    percent: boolean;

    /**
     * @en (Optional) Drawing color
     * @zh （可选）绘图颜色
     */
    color: number = 0xffffffff;

    /**
     * @private
     * @en Create a FillTextureCmd instance
     * @param texture The texture to be filled
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param width Width of the filled area
     * @param height Height of the filled area
     * @param type Fill type
     * @param offset Texture offset
     * @param color Drawing color
     * @returns FillTextureCmd instance
     * @zh 创建绘制填充贴图的命令实例
     * @param texture 要填充的纹理
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width 填充区域的宽度
     * @param height 填充区域的高度
     * @param type 填充类型
     * @param offset 贴图纹理偏移
     * @param color 绘图颜色
     * @returns FillTextureCmd实例
     */
    static create(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, color: string): FillTextureCmd {
        var cmd: FillTextureCmd = Pool.getItemByClass("FillTextureCmd", FillTextureCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.type = type;
        cmd.offset = offset;
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
        this.offset = null;
        Pool.recover("FillTextureCmd", this);
    }

    /**
     * @private
     * @en Execute the fill texture command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制填充贴图命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        if (this.texture) {
            if (this.percent && context.sprite) {
                let w = context.sprite.width;
                let h = context.sprite.height;
                context.fillTexture(this.texture, this.x * w + gx, this.y * h + gy, this.width * w, this.height * h, this.type, this.offset || Point.EMPTY, this.color);
            }
            else
                context.fillTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height, this.type, this.offset || Point.EMPTY, this.color);
        }
    }

    /**
     * @private
     * @en The identifier for the FillTextureCmd
     * @zh 填充贴图命令的标识符
     */
    get cmdID(): string {
        return FillTextureCmd.ID;
    }

    /**
     * @en Get the vertex data of the bounding box
     * @param sp The sprite that draws the command
     * @returns Array of vertex data
     * @zh 获取包围盒的顶点数据
     * @param sp 绘制命令的精灵对象
     * @returns 顶点数据数组
     */
    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        if (this.width && this.height)
            return Rectangle._getBoundPointS(this.x, this.y, this.width, this.height, this.percent ? sp : null);
        else
            return Rectangle._getBoundPointS(this.x, this.y, this.texture.width, this.texture.height);
    }
}

ClassUtils.regClass("FillTextureCmd", FillTextureCmd);
