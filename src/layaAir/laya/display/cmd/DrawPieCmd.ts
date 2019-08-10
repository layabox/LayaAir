import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 绘制扇形
 */
export class DrawPieCmd {
    static ID: string = "DrawPie";

    /**
     * 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * 扇形半径。
     */
    radius: number;
    private _startAngle: number;
    private _endAngle: number;
    /**
     * 填充颜色，或者填充绘图的渐变对象。
     */
    fillColor: any;
    /**
     * （可选）边框颜色，或者填充绘图的渐变对象。
     */
    lineColor: any;
    /**
     * （可选）边框宽度。
     */
    lineWidth: number;
    /**@private */
    vid: number;

    /**@private */
    static create(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): DrawPieCmd {
        var cmd: DrawPieCmd = Pool.getItemByClass("DrawPieCmd", DrawPieCmd);
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
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawPieCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context._drawPie(this.x + gx, this.y + gy, this.radius, this._startAngle, this._endAngle, this.fillColor, this.lineColor, this.lineWidth, this.vid);
    }

    /**@private */
    get cmdID(): string {
        return DrawPieCmd.ID;
    }

    /**
     * 开始角度。
     */
    get startAngle(): number {
        return this._startAngle * 180 / Math.PI;
    }

    set startAngle(value: number) {
        this._startAngle = value * Math.PI / 180;
    }

    /**
     * 结束角度。
     */
    get endAngle(): number {
        return this._endAngle * 180 / Math.PI;
    }

    set endAngle(value: number) {
        this._endAngle = value * Math.PI / 180;
    }
}

