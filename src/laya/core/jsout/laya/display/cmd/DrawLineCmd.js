import { Pool } from "../../utils/Pool";
/**
 * 绘制单条曲线
 */
export class DrawLineCmd {
    /**@private */
    static create(fromX, fromY, toX, toY, lineColor, lineWidth, vid) {
        var cmd = Pool.getItemByClass("DrawLineCmd", DrawLineCmd);
        cmd.fromX = fromX;
        cmd.fromY = fromY;
        cmd.toX = toX;
        cmd.toY = toY;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("DrawLineCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context._drawLine(gx, gy, this.fromX, this.fromY, this.toX, this.toY, this.lineColor, this.lineWidth, this.vid);
    }
    /**@private */
    get cmdID() {
        return DrawLineCmd.ID;
    }
}
DrawLineCmd.ID = "DrawLine";
