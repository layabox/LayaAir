import { Point } from "../../maths/Point"
import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { Pool } from "../../utils/Pool"

/**
 * 填充贴图
 */
export class FillTextureCmd {
    static ID: string = "FillTexture";

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
    static create(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, other: any): FillTextureCmd {
        var cmd: FillTextureCmd = Pool.getItemByClass("FillTextureCmd", FillTextureCmd);
        cmd.texture = texture;
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.type = type;
        cmd.offset = offset;
        cmd.other = other;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.texture = null;
        this.offset = null;
        this.other = null;
        Pool.recover("FillTextureCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.fillTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height, this.type, this.offset, this.other);
    }

    /**@private */
    get cmdID(): string {
        return FillTextureCmd.ID;
    }

}

