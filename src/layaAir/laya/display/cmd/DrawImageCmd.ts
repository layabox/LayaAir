import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { Pool } from "../../utils/Pool"

/**
 * 绘制图片
 */
export class DrawImageCmd {
    static ID: string = "DrawImage";

    /**
     * 纹理。
     */
    texture: Texture|null;
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

    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number): DrawImageCmd {
        var cmd: DrawImageCmd = Pool.getItemByClass("DrawImageCmd", DrawImageCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.texture && this.texture._removeReference();
        this.texture = null;
        Pool.recover("DrawImageCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
		if(this.texture)
        	context.drawTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height);
    }

    /**@private */
    get cmdID(): string {
        return DrawImageCmd.ID;
    }

}

