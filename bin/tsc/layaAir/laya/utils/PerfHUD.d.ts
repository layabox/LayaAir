import { Sprite } from "../display/Sprite";
import { Context } from "../resource/Context";
export declare class PerfHUD extends Sprite {
    private static _lastTm;
    private static _now;
    private datas;
    static DATANUM: number;
    xdata: any[];
    ydata: any[];
    hud_width: number;
    hud_height: number;
    gMinV: number;
    gMaxV: number;
    private textSpace;
    static inst: PerfHUD;
    private _now;
    private sttm;
    static drawTexTm: number;
    constructor();
    now(): number;
    start(): void;
    end(i: number): void;
    config(w: number, h: number): void;
    addDataDef(id: number, color: number, name: string, scale: number): void;
    updateValue(id: number, v: number): void;
    v2y(v: number): number;
    drawHLine(ctx: Context, v: number, color: string, text: string): void;
    customRender(ctx: Context, x: number, y: number): void;
}
