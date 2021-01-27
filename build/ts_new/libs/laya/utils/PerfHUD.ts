import { PerfData } from "./PerfData";
import { Sprite } from "../display/Sprite"
import { SpriteConst } from "../display/SpriteConst"
import { Context } from "../resource/Context"
/**
 * @internal
 */
export class PerfHUD extends Sprite {
    private static _lastTm: number = 0;	//perf Data
    private static _now: () => number = null;
    private datas: any[] = [];
    static DATANUM: number = 300;

    xdata: any[] = new Array(PerfHUD.DATANUM);
    ydata: any[] = new Array(PerfHUD.DATANUM);

    hud_width: number = 800;
    hud_height: number = 200;

    gMinV: number = 0;
    gMaxV: number = 100;

    private textSpace: number = 40;	//留给刻度文字的
    static inst: PerfHUD;

    private _now: Function;
    private sttm: number = 0;

    static drawTexTm: number = 0;

    //TODO:coverage
    constructor() {
        super();
        PerfHUD.inst = this;
        this._renderType |= SpriteConst.CUSTOM;
        this._setRenderType(this._renderType);
        this._setCustomRender();

        this.addDataDef(0, 0xffffff, 'frame', 1.0);
        this.addDataDef(1, 0x00ff00, 'update', 1.0);
        this.addDataDef(2, 0xff0000, 'flush', 1.0);
        PerfHUD._now = performance ? performance.now.bind(performance) : Date.now;
    }

    //TODO:coverage
    now(): number {
        return PerfHUD._now();
    }

    //TODO:coverage
    start(): void {
        this.sttm = PerfHUD._now();
    }

    //TODO:coverage
    end(i: number): void {
        var dt: number = PerfHUD._now() - this.sttm;
        this.updateValue(i, dt);
    }

    //TODO:coverage
    config(w: number, h: number): void {
        this.hud_width = w;
        this.hud_height = h;
    }

    //TODO:coverage
    addDataDef(id: number, color: number, name: string, scale: number): void {
        this.datas[id] = new PerfData(id, color, name, scale);
    }

    //TODO:coverage
    updateValue(id: number, v: number): void {
        this.datas[id].addData(v);
    }

    //TODO:coverage
    v2y(v: number): number {
        var bb: number = this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
        return this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
    }

    //TODO:coverage
    drawHLine(ctx: Context, v: number, color: string, text: string): void {
        var sx: number = this._x;
        var ex: number = this._x + this.hud_width;
        var sy: number = this.v2y(v);
        ctx.fillText(text, sx, sy - 6, null, 'green', null);
        sx += this.textSpace;
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, this._x + this.hud_width, 1, null);
    }

    //TODO:coverage
    /**
     * 
     * @param ctx 
     * @param x 
     * @param y 
     * @override
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

