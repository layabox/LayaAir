import { Pool } from "../../utils/Pool";
/**
 * 绘制矩形
 */
export class DrawRectCmd {
    /**@private */
    static create(x, y, width, height, fillColor, lineColor, lineWidth) {
        var cmd = Pool.getItemByClass("DrawRectCmd", DrawRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawRectCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.drawRect(this.x + gx, this.y + gy, this.width, this.height, this.fillColor, this.lineColor, this.lineWidth);
    }
    /**@private */
    get cmdID() {
        return DrawRectCmd.ID;
    }
}
DrawRectCmd.ID = "DrawRect";
