import { ColorFilter } from "../../filters/ColorFilter";
import { Pool } from "../../utils/Pool";
/**
 * 绘制单个贴图
 */
export class DrawTextureCmd {
    constructor() {
        this.colorFlt = null;
        this.uv = null;
    }
    /**@private */
    static create(texture, x, y, width, height, matrix, alpha, color, blendMode, uv) {
        var cmd = Pool.getItemByClass("DrawTextureCmd", DrawTextureCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.matrix = matrix;
        cmd.alpha = alpha;
        cmd.color = color;
        cmd.blendMode = blendMode;
        cmd.uv = uv;
        if (color) {
            cmd.colorFlt = new ColorFilter();
            cmd.colorFlt.setColor(color);
        }
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.texture._removeReference();
        this.texture = null;
        this.matrix = null;
        Pool.recover("DrawTextureCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.drawTextureWithTransform(this.texture, this.x, this.y, this.width, this.height, this.matrix, gx, gy, this.alpha, this.blendMode, this.colorFlt, this.uv);
    }
    /**@private */
    get cmdID() {
        return DrawTextureCmd.ID;
    }
}
DrawTextureCmd.ID = "DrawTexture";
