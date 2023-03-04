import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { Pool } from "../../utils/Pool"
import { DrawTextureFlags } from '../../webgl/utils/MeshQuadTexture';

/**
 * 根据坐标集合绘制多个贴图
 */
export class DrawTexturesCmd {
    static ID: string = "DrawTextures";

    /**
     * 纹理。
     */
    texture: Texture;
    /**
     * 绘制次数和坐标。
     */
    pos: ArrayLike<number>;

    /** 附加顶点色 */
    colors: number[];

    /** 绘制颜色填充模式标记 */
    flags: DrawTextureFlags[];

    /**@private */
    static create(texture: Texture, pos: any[], colors: number[], flags: number[]): DrawTexturesCmd {
        var cmd: DrawTexturesCmd = Pool.getItemByClass("DrawTexturesCmd", DrawTexturesCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.pos = pos;
        cmd.colors = colors || [];
        cmd.flags = flags || [];
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.texture._removeReference();
        this.texture = null;
        this.pos = null;
        Pool.recover("DrawTexturesCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawTextures(this.texture, this.pos, gx, gy, this.colors, this.flags);
    }

    /**@private */
    get cmdID(): string {
        return DrawTexturesCmd.ID;
    }

}

