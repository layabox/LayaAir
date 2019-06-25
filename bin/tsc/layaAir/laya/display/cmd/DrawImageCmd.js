import { Pool } from "../../utils/Pool";
/**
 * 绘制图片
 */
export class DrawImageCmd {
    /**@private */
    static create(texture, x, y, width, height) {
        var cmd = Pool.getItemByClass("DrawImageCmd", DrawImageCmd);
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
    recover() {
        this.texture._removeReference();
        this.texture = null;
        Pool.recover("DrawImageCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.drawTexture(this.texture, this.x + gx, this.y + gy, this.width, this.height);
    }
    /**@private */
    get cmdID() {
        return DrawImageCmd.ID;
    }
}
DrawImageCmd.ID = "DrawImage";
