import { Point } from "../../maths/Point"
import { Rectangle } from "../../maths/Rectangle";
import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool";

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
    type?: string;
    /**
     * （可选）贴图纹理偏移
     */
    offset?: Point;

    /**
     * 位置和大小是否是百分比
     */
    percent: boolean;

    /** （可选）绘图颜色 */
    color: number = 0xffffffff;

    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, color: number): FillTextureCmd {
        var cmd: FillTextureCmd = Pool.getItemByClass("FillTextureCmd", FillTextureCmd);
        cmd.texture = texture;
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.type = type;
        cmd.offset = offset;
        cmd.color = color;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.texture = null;
        this.offset = null;
        Pool.recover("FillTextureCmd", this);
    }

    /**@private */
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

    /**@private */
    get cmdID(): string {
        return FillTextureCmd.ID;
    }

    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        if (this.width && this.height)
            return Rectangle._getBoundPointS(this.x, this.y, this.width, this.height, this.percent ? sp : null);
        else
            return Rectangle._getBoundPointS(this.x, this.y, this.texture.width, this.texture.height);
    }
}

ClassUtils.regClass("FillTextureCmd", FillTextureCmd);
