import { Context } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw a pie chart
 * @zh 绘制扇形
 */
export class DrawPieCmd {
    /**
     * @en Identifier for the DrawPieCmd
     * @zh 绘制扇形命令的标识符
     */
    static ID: string = "DrawPie";

    /**
     * @en The X-axis position to start drawing.
     * @zh 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * @en The Y-axis position to start drawing.
     * @zh 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * @en The radius of the pie chart.
     * @zh 扇形半径。
     */
    radius: number = 0;

    /**
     * @en The fill color 
     * @zh 填充颜色 
     */
    fillColor: any;
    /**
     * @en (Optional) The border color  
     * @zh （可选）边框颜色 
     */
    lineColor: any;
    /**
     * @en (Optional) The width of the border.
     * @zh （可选）边框宽度。
     */
    lineWidth: number = 0;

    private _startAngle: number;
    private _endAngle: number;

    /**
     * @en Create a DrawPieCmd instance
     * @param x The X-axis position to start drawing
     * @param y The Y-axis position to start drawing
     * @param radius The radius of the pie chart
     * @param startAngle The start angle of the pie chart
     * @param endAngle The end angle of the pie chart
     * @param fillColor The fill color 
     * @param lineColor The border color 
     * @param lineWidth The width of the border
     * @returns DrawPieCmd instance
     * @zh 创建一个绘制扇形命令实例
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param radius 扇形半径
     * @param startAngle 扇形起始角度
     * @param endAngle 扇形终止角度
     * @param fillColor 填充颜色 
     * @param lineColor 边框颜色 
     * @param lineWidth 边框宽度
     * @returns 绘制扇形命令实例
     */
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
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.fillColor = null;
        this.lineColor = null;
        Pool.recover("DrawPieCmd", this);
    }

    /**
     * @en Execute the drawing command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制命令
     * @param context 渲染上下文
     * @param gx 全局 X 偏移
     * @param gy 全局 Y 偏移
     */
    run(context: Context, gx: number, gy: number): void {
        let offset = (this.lineWidth >= 1 && this.lineColor) ? this.lineWidth / 2 : 0;
        let lineOffset = this.lineColor ? this.lineWidth : 0;
        context._drawPie(this.x + offset + gx, this.y + offset + gy, this.radius - lineOffset, this._startAngle, this._endAngle, this.fillColor, this.lineColor, this.lineWidth, 0);
    }

    /**
     * @en The identifier for the DrawPieCmd
     * @zh 绘制扇形命令的标识符
     */
    get cmdID(): string {
        return DrawPieCmd.ID;
    }

    /**
     * @en The start angle of the pie chart in degrees.
     * @zh 开始角度（以度为单位）。
     */
    get startAngle(): number {
        return this._startAngle * 180 / Math.PI;
    }

    set startAngle(value: number) {
        this._startAngle = value * Math.PI / 180;
    }

    /**
     * @en The end angle of the pie chart in degrees.
     * @zh 结束角度（以度为单位）。
     */
    get endAngle(): number {
        return this._endAngle * 180 / Math.PI;
    }

    set endAngle(value: number) {
        this._endAngle = value * Math.PI / 180;
    }

    /**
     * @en Get the boundary points of the pie chart
     * @zh 获取扇形的边界点
     */
    getBoundPoints(): number[] {
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