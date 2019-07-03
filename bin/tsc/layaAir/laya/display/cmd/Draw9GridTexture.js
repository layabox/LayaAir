import { Pool } from "../../utils/Pool";
/**
 * 绘制带九宫格信息的图片
 * @internal
 */
export class Draw9GridTexture {
    constructor() {
    }
    /**@private */
    static create(texture, x, y, width, height, sizeGrid) {
        var cmd = Pool.getItemByClass("Draw9GridTexture", Draw9GridTexture);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.sizeGrid = sizeGrid;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.texture._removeReference();
        Pool.recover("Draw9GridTexture", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.drawTextureWithSizeGrid(this.texture, this.x, this.y, this.width, this.height, this.sizeGrid, gx, gy);
    }
    /**@private */
    get cmdID() {
        return Draw9GridTexture.ID;
    }
}
Draw9GridTexture.ID = "Draw9GridTexture";
