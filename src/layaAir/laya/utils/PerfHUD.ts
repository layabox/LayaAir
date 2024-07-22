import { PerfData } from "./PerfData";
import { Sprite } from "../display/Sprite"
import { SpriteConst } from "../display/SpriteConst"
import { Context } from "../renders/Context"
/**
 * @internal
 * @en Performance Heads-Up Display (HUD) class.
 * This class provides a visual representation of various performance metrics over time.
 * @zh 性能的抬头显示器（HUD）类。
 * 该类提供了各种性能指标随时间变化的可视化表示。
 */
export class PerfHUD extends Sprite {
    /** 
    * @en Last recorded timestamp for performance data
    * @zh 上次记录的性能数据时间戳
    */
    private static _lastTm: number = 0;	//perf Data
    /** 
     * @en Function to get current time
     * @zh 获取当前时间的函数
     */
    private static _now: () => number = null;
    /** 
     * @en Array to store different performance data sets
     * @zh 存储不同性能数据集的数组
     */
    private datas: any[] = [];
    /** 
     * @en Number of data points to display
     * @zh 要显示的数据点数量
     */
    static DATANUM: number = 300;

    /**
     * @en An array to store x-axis data for the HUD display.
     * @zh 存储 HUD 显示的 x 轴数据的数组。
     */
    xdata: any[] = new Array(PerfHUD.DATANUM);
    /**
     * @en An array to store y-axis data for the HUD display.
     * @zh 存储 HUD 显示的 y 轴数据的数组。
     */
    ydata: any[] = new Array(PerfHUD.DATANUM);

    /**
     * @en The width of the HUD display area.
     * @zh HUD 显示区域的宽度。
     */
    hud_width: number = 800;
    /**
     * @en The height of the HUD display area.
     * @zh HUD 显示区域的高度。
     */
    hud_height: number = 200;

    /**
     * @en The minimum value for vertical scale of the HUD.
     * @zh HUD 垂直尺度的最小值。
     */
    gMinV: number = 0;
    /**
     * @en The maximum value for vertical scale of the HUD.
     * @zh HUD 垂直尺度的最大值。
     */
    gMaxV: number = 100;

    private textSpace: number = 40;	//留给刻度文字的
    /**
     * @en Static reference to a PerfHUD instance.
     * @zh PerfHUD实例的静态引用。
     */
    static inst: PerfHUD;

    private _now: Function;
    private sttm: number = 0;

    static drawTexTm: number = 0;

    //TODO:coverage
    constructor() {
        super();
        PerfHUD.inst = this;
        this._renderType |= SpriteConst.CUSTOM;
        this._setCustomRender();

        this.addDataDef(0, 0xffffff, 'frame', 1.0);
        this.addDataDef(1, 0x00ff00, 'update', 1.0);
        this.addDataDef(2, 0xff0000, 'flush', 1.0);
        PerfHUD._now = performance ? performance.now.bind(performance) : Date.now;
    }

    /** 
     * @en Function to get current time
     * @zh 获取当前时间的函数
     */
    //TODO:coverage
    now(): number {
        return PerfHUD._now();
    }

    /**
     * @en Start the performance measurement.
     * @zh 开始性能测量。
     */
    //TODO:coverage
    start(): void {
        this.sttm = PerfHUD._now();
    }

    /**
     * @en End the performance measurement and update the value.
     * @zh 结束性能测量并更新值。
     */
    //TODO:coverage
    end(i: number): void {
        var dt: number = PerfHUD._now() - this.sttm;
        this.updateValue(i, dt);
    }

    /**
     * @en Configure the size of the HUD display area.
     * @zh 配置 HUD 显示区域的大小。
     */
    //TODO:coverage
    config(w: number, h: number): void {
        this.hud_width = w;
        this.hud_height = h;
    }

    /**
     * @en Add a new data definition to the HUD.
     * @zh 添加一个新的数据定义到 HUD。
     */
    //TODO:coverage
    addDataDef(id: number, color: number, name: string, scale: number): void {
        this.datas[id] = new PerfData(id, color, name, scale);
    }

    /**
     * @en Update the value of a specific data point.
     * @zh 更新特定数据点的值。
     */
    //TODO:coverage
    updateValue(id: number, v: number): void {
        this.datas[id].addData(v);
    }

    /**
     * @en Convert a value to its corresponding y-coordinate on the HUD.
     * @zh 将值转换为其在 HUD 上对应的 y 坐标。
     */
    //TODO:coverage
    v2y(v: number): number {
        // var bb: number = this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
        return this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
    }

    /**
     * @en Draw a horizontal line on the HUD with a label.
     * @zh 在 HUD 上绘制带有标签的水平线。
     */
    //TODO:coverage
    drawHLine(ctx: Context, v: number, color: string, text: string): void {
        var sx: number = this._x;
        // var ex: number = this._x + this.hud_width;
        var sy: number = this.v2y(v);
        ctx.fillText(text, sx, sy - 6, null, 'green', null);
        sx += this.textSpace;
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, this._x + this.hud_width, 1, null);
    }

    //TODO:coverage
    /**
     * @override
     * @en Custom render method for the HUD.
     * @param ctx The rendering context.
     * @param x The x-coordinate of the HUD.
     * @param y The y-coordinate of the HUD.
     * @zh HUD 的自定义渲染方法。
     * @param ctx 渲染上下文。
     * @param x HUD 的 x 坐标。
     * @param y HUD 的 y 坐标。
     */
    customRender(ctx: Context, x: number, y: number): void {
        var now: number = performance.now();;
        if (PerfHUD._lastTm <= 0) PerfHUD._lastTm = now;
        this.updateValue(0, now - PerfHUD._lastTm);
        PerfHUD._lastTm = now;

        ctx.save();
        ctx.fillRect(this._x, this._y, this.hud_width, this.hud_height + 4, '#000000cc');
        ctx.globalAlpha = 0.9;
        /*
        for ( var i = 0; i < gMaxV; i+=30) {
            drawHLine(ctx, i, 'green', '' + i);// '' + Math.round(1000 / (i + 1)));
        }
        */
        this.drawHLine(ctx, 0, 'green', '    0');
        this.drawHLine(ctx, 10, 'green', '  10');
        this.drawHLine(ctx, 16.667, 'red', ' ');
        this.drawHLine(ctx, 20, 'green', '50|20');
        this.drawHLine(ctx, 16.667 * 2, 'yellow', '');
        this.drawHLine(ctx, 16.667 * 3, 'yellow', '');
        this.drawHLine(ctx, 16.667 * 4, 'yellow', '');
        this.drawHLine(ctx, 50, 'green', '20|50');
        this.drawHLine(ctx, 100, 'green', '10|100');

        //数据
        for (var di: number = 0, sz: number = this.datas.length; di < sz; di++) {
            var cd: PerfData = this.datas[di];
            if (!cd) continue;
            var dtlen: number = cd.datas.length;
            var dx: number = (this.hud_width - this.textSpace) / dtlen;
            var cx: number = cd.datapos;
            var _cx: number = this._x + this.textSpace;
            ctx.fillStyle = cd.color;
            //开始部分
            /*
            ctx.beginPath();
            ctx.strokeStyle = cd.color;
            ctx.moveTo(_cx, v2y(cd.datas[cx]* cd.scale) );
            cx++;
            _cx += dx;
            for ( var dtsz:int = dtlen; cx < dtsz; cx++) {
                ctx.lineTo(_cx, v2y(cd.datas[cx]* cd.scale) );
                _cx += dx;
            }
            //剩下的
            for (cx = 0; cx < cd.datapos; cx++) {
                ctx.lineTo(_cx, v2y(cd.datas[cx] * cd.scale));
                _cx += dx;
            }
            ctx.stroke();
            */
            for (var dtsz: number = dtlen; cx < dtsz; cx++) {
                var sty: number = this.v2y(cd.datas[cx] * cd.scale);
                ctx.fillRect(_cx, sty, dx, this.hud_height + this._y - sty, null);
                _cx += dx;
            }
            //剩下的
            for (cx = 0; cx < cd.datapos; cx++) {
                sty = this.v2y(cd.datas[cx] * cd.scale);
                ctx.fillRect(_cx, sty, dx, this.hud_height + this._y - sty, null);
                _cx += dx;
            }

        }
        ctx.restore();
    }
}

