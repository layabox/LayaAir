import { Pool } from "../../utils/Pool";
/**
 * 绘制圆形
 */
export class DrawCircleCmd {
    /**@private */
    static create(x, y, radius, fillColor, lineColor, lineWidth, vid) {
        var cmd = Pool.getItemByClass("DrawCircleCmd", DrawCircleCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        cmd.vid = vid;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawCircleCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context._drawCircle(this.x + gx, this.y + gy, this.radius, this.fillColor, this.lineColor, this.lineWidth, this.vid);
    }
    /**@private */
    get cmdID() {
        return DrawCircleCmd.ID;
    }
}
DrawCircleCmd.ID = "DrawCircle";
