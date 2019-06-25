import { Pool } from "../../utils/Pool";
/**
 * 根据坐标集合绘制多个贴图
 */
export class DrawTexturesCmd {
    /**@private */
    static create(texture, pos) {
        var cmd = Pool.getItemByClass("DrawTexturesCmd", DrawTexturesCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.pos = pos;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.texture._removeReference();
        this.texture = null;
        this.pos = null;
        Pool.recover("DrawTexturesCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.drawTextures(this.texture, this.pos, gx, gy);
    }
    /**@private */
    get cmdID() {
        return DrawTexturesCmd.ID;
    }
}
DrawTexturesCmd.ID = "DrawTextures";
