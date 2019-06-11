import { Pool } from "../../utils/Pool";
/**
 * 根据路径绘制矢量图形
 */
export class DrawPathCmd {
    /**@private */
    static create(x, y, paths, brush, pen) {
        var cmd = Pool.getItemByClass("DrawPathCmd", DrawPathCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.paths = paths;
        cmd.brush = brush;
        cmd.pen = pen;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.paths = null;
        this.brush = null;
        this.pen = null;
        Pool.recover("DrawPathCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context._drawPath(this.x + gx, this.y + gy, this.paths, this.brush, this.pen);
    }
    /**@private */
    get cmdID() {
        return DrawPathCmd.ID;
    }
}
DrawPathCmd.ID = "DrawPath";
