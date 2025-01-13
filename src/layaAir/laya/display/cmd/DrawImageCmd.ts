import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../renders/Context"
import { Texture } from "../../resource/Texture"
import { ColorUtils } from "../../utils/ColorUtils";
import { Pool } from "../../utils/Pool"
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";

/**
 * @en Draw image command
 * @zh 绘制图片命令
 */
export class DrawImageCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the DrawImageCmd
     * @zh 绘制图片命令的标识符
     */
    static ID: string = "DrawImage";

    /**
     * @en Texture to be drawn
     * @zh 要绘制的纹理
     */
    texture: Texture | null;
    /**
     * @en (Optional) X-axis offset
     * @zh （可选）X轴偏移量
     */
    x: number;
    /**
     * @en (Optional) Y-axis offset
     * @zh （可选）Y轴偏移量
     */
    y: number;
    /**
     * @en (Optional) Width of the drawn image
     * @zh （可选）绘制图片的宽度
     */
    width: number;
    /**
     * @en (Optional) Height of the drawn image
     * @zh （可选）绘制图片的高度
     */
    height: number;

    /**
     * @en (Optional) Drawing color
     * @zh （可选）绘图颜色
     */
    color: number = 0xffffffff;

    /**
     * @en Create a DrawImageCmd instance
     * @param texture Texture to be drawn
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param width Width of the drawn image
     * @param height Height of the drawn image
     * @param color Drawing color
     * @returns A DrawImageCmd instance
     * @zh 创建一个绘制图片命令实例
     * @param texture 要绘制的纹理
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width 绘制图片的宽度
     * @param height 绘制图片的高度
     * @param color 绘图颜色
     * @returns 绘制图片命令实例
     */
    static create(texture: Texture, x: number, y: number, width: number, height: number, color: string): DrawImageCmd {
        let cmd: DrawImageCmd = Pool.getItemByClass("DrawImageCmd", DrawImageCmd);
        cmd.texture = texture;
        texture && texture._addReference();
        cmd.x = x ?? 0;
        cmd.y = y ?? 0;
        cmd.width = width ?? texture.sourceWidth;
        cmd.height = height ?? texture.sourceHeight;
        cmd.color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
        return cmd;
    }

    /**
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        this.texture && this.texture._removeReference();
        this.texture = null;
        Pool.recover("DrawImageCmd", this);
    }

    /**
     * @en Execute the draw image command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制图片命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let tex = this.texture;
        if (!tex)
            return;

        let x = this.x, y = this.y, w = this.width, h = this.height;

        let wRate = w / tex.sourceWidth;
        let hRate = h / tex.sourceHeight;
        w = tex.width * wRate;
        h = tex.height * hRate;

        x += tex.offsetX * wRate;
        y += tex.offsetY * hRate;

        context.drawTexture(this.texture, x + gx, y + gy, w, h, this.color);
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        Rectangle.TEMP.setTo(this.x, this.y, this.width, this.height).getBoundPoints(assembler.points);
    }

    /**
     * @en The identifier for the DrawImageCmd
     * @zh 绘制图片命令的标识符
     */
    get cmdID(): string {
        return DrawImageCmd.ID;
    }

}

