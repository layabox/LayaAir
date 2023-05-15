import { Context } from "../../resource/Context"
import { ClassUtils } from "../../utils/ClassUtils";
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
    radius: number = 0;

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
    lineWidth: number = 0;

    private _startAngle: number;
    private _endAngle: number;

    /**@private */
    static create(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number): DrawPieCmd {
        var cmd: DrawPieCmd = Pool.getItemByClass("DrawPieCmd", DrawPieCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.radius = radius;
        cmd._startAngle = startAngle;
        cmd._endAngle = endAngle;
        cmd.fillColor = fillColor;
        cmd.lineColor = lineColor;
        cmd.lineWidth = lineWidth;
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
        let offset = this.lineWidth >= 1 ? this.lineWidth / 2 : 0;
        let lineOffset = this.lineWidth;
        context._drawPie(this.x + offset + gx, this.y + offset + gy, this.radius - lineOffset, this._startAngle, this._endAngle, this.fillColor, this.lineColor, this.lineWidth, 0);
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

    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        let rst: any[] = _tempPoints;
        _tempPoints.length = 0;
        let k: number = Math.PI / 180;
        let d1: number = this.endAngle - this.startAngle;
        let x = this.x, y = this.y, radius = this.radius;
        if (d1 >= 360 || d1 <= -360) {
            // 如果满了一圈了
            rst.push(x - radius, y - radius);
            rst.push(x + radius, y - radius);
            rst.push(x + radius, y + radius);
            rst.push(x - radius, y + radius);
            return rst;
        }
        // 
        rst.push(x, y);	// 中心

        var delta: number = d1 % 360;
        if (delta < 0) delta += 360;

        // 一定增加，且在360以内的end
        var end1: number = this.startAngle + delta;

        // 转成弧度
        var st: number = this.startAngle * k;
        var ed: number = end1 * k;

        // 起点
        rst.push(x + radius * Math.cos(st), y + radius * Math.sin(st));
        // 终点
        rst.push(x + radius * Math.cos(ed), y + radius * Math.sin(ed));

        // 圆形的四个边界点
        // 按照90度对齐，看看会经历几个90度
        var s1: number = Math.ceil(this.startAngle / 90) * 90;	//开始的。start的下一个90度
        var s2: number = Math.floor(end1 / 90) * 90;		//结束。end的上一个90度
        for (var cs: number = s1; cs <= s2; cs += 90) {
            var csr: number = cs * k;
            rst.push(x + radius * Math.cos(csr), y + radius * Math.sin(csr));
        }
        return rst;
    }
}

const _tempPoints: any[] = [];

ClassUtils.regClass("DrawPieCmd", DrawPieCmd);