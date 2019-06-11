import { Pool } from "../../utils/Pool";
/**
 * 绘制扇形
 */
export class DrawPieCmd {
    /**@private */
    static create(x, y, radius, startAngle, endAngle, fillColor, lineColor, lineWidth, vid) {
        var cmd = Pool.getItemByClass("DrawPieCmd", DrawPieCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
        cmd._startAngle = startAngle;
        cmd._endAngle = endAngle;
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
        Pool.recover("DrawPieCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context._drawPie(this.x + gx, this.y + gy, this.radius, this._startAngle, this._endAngle, this.fillColor, this.lineColor, this.lineWidth, this.vid);
    }
    /**@private */
    get cmdID() {
        return DrawPieCmd.ID;
    }
    /**
     * 开始角度。
     */
    get startAngle() {
        return this._startAngle * 180 / Math.PI;
    }
    set startAngle(value) {
        this._startAngle = value * Math.PI / 180;
    }
    /**
     * 结束角度。
     */
    get endAngle() {
        return this._endAngle * 180 / Math.PI;
    }
    set endAngle(value) {
        this._endAngle = value * Math.PI / 180;
    }
}
DrawPieCmd.ID = "DrawPie";
