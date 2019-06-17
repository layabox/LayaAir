import { Pool } from "../../utils/Pool";
/**
 * 绘制曲线
 */
export class DrawCurvesCmd {
    /**@private */
    static create(x, y, points, lineColor, lineWidth) {
        var cmd = Pool.getItemByClass("DrawCurvesCmd", DrawCurvesCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.points = points;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.points = null;
        this.lineColor = null;
        Pool.recover("DrawCurvesCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.drawCurves(this.x + gx, this.y + gy, this.points, this.lineColor, this.lineWidth);
    }
    /**@private */
    get cmdID() {
        return DrawCurvesCmd.ID;
    }
}
DrawCurvesCmd.ID = "DrawCurves";
