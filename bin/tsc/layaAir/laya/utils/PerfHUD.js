import { PerfData } from "./PerfData";
import { Sprite } from "../display/Sprite";
import { SpriteConst } from "../display/SpriteConst";
export class PerfHUD extends Sprite {
    //TODO:coverage
    constructor() {
        super();
        this.datas = [];
        this.xdata = new Array(PerfHUD.DATANUM);
        this.ydata = new Array(PerfHUD.DATANUM);
        this.hud_width = 800;
        this.hud_height = 200;
        this.gMinV = 0;
        this.gMaxV = 100;
        this.textSpace = 40; //留给刻度文字的
        this.sttm = 0;
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
    now() {
        return PerfHUD._now();
    }
    //TODO:coverage
    start() {
        this.sttm = PerfHUD._now();
    }
    //TODO:coverage
    end(i) {
        var dt = PerfHUD._now() - this.sttm;
        this.updateValue(i, dt);
    }
    //TODO:coverage
    config(w, h) {
        this.hud_width = w;
        this.hud_height = h;
    }
    //TODO:coverage
    addDataDef(id, color, name, scale) {
        this.datas[id] = new PerfData(id, color, name, scale);
    }
    //TODO:coverage
    updateValue(id, v) {
        this.datas[id].addData(v);
    }
    //TODO:coverage
    v2y(v) {
        var bb = this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
        return this._y + this.hud_height * (1 - (v - this.gMinV) / this.gMaxV);
    }
    //TODO:coverage
    drawHLine(ctx, v, color, text) {
        var sx = this._x;
        var ex = this._x + this.hud_width;
        var sy = this.v2y(v);
        ctx.fillText(text, sx, sy - 6, null, 'green', null);
        sx += this.textSpace;
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, this._x + this.hud_width, 1, null);
    }
    //TODO:coverage
    /*override*/ customRender(ctx, x, y) {
        var now = performance.now();
        ;
        if (PerfHUD._lastTm <= 0)
            PerfHUD._lastTm = now;
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
        for (var di = 0, sz = this.datas.length; di < sz; di++) {
            var cd = this.datas[di];
            if (!cd)
                continue;
            var dtlen = cd.datas.length;
            var dx = (this.hud_width - this.textSpace) / dtlen;
            var cx = cd.datapos;
            var _cx = this._x + this.textSpace;
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
            for (var dtsz = dtlen; cx < dtsz; cx++) {
                var sty = this.v2y(cd.datas[cx] * cd.scale);
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
PerfHUD._lastTm = 0; //perf Data
PerfHUD._now = null;
PerfHUD.DATANUM = 300;
PerfHUD.drawTexTm = 0;
