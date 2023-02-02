
import { Browser } from "./Browser";
import { Sprite } from "../display/Sprite"
import { Text } from "../display/Text"
import { Context } from "../resource/Context"
import { HTMLCanvas } from "../resource/HTMLCanvas"
import { Stat, StatToggleUIParams, StatUIParams } from "./Stat";
import { ILaya } from "../../ILaya";
import { IStatRender } from "./IStatRender";
import { CheckBox } from "../ui/CheckBox";
import { Laya } from "../../Laya";
import { Texture2D } from "../resource/Texture2D";

/**
 * 显示Stat的结果。由于stat会引入很多的循环引用，所以把显示部分拆开
 * @author laya
 */
export class StatUI extends IStatRender {
    private static _fontSize: number = 14;
    private static _toggleSize: number = 16;
    private _txt: Text;
    private _leftText: Text;
    /**@internal */
    _sp: Sprite;
    /**@internal */
    _show: boolean = false;
    /**@internal */
    _showToggle: boolean = false;
    private _canvas: HTMLCanvas;
    private _ctx: Context;
    private _first: boolean;
    private _vx: number;
    private _width: number;
    private _height: number = 100;
    private _view: any[] = [];
    private _toggleView: any[] = [];


    /**
     * @override
     * 显示性能统计信息。
     * @param	x X轴显示位置。
     * @param	y Y轴显示位置。
     */
    show(x: number = 0, y: number = 0, views: Array<StatUIParams>): void {
        this._view.length = views.length;
        for (let i = 0, n = this._view.length; i < n; i++) {
            this._view[i] = views[i];
        }
        if (!this._show) {
            this.createUI(x, y);
            this.enable();
        }
        this._show = true;
    }

    showToggle(x: number = 0, y: number = 0, views: Array<StatToggleUIParams>) {
        ILaya.Loader.cacheRes("defaultCheckBox",Texture2D.defalutUITexture,"TEXTURE2D");
        this._toggleView.length = views.length;
        for (let i = 0, n = this._toggleView.length; i < n; i++) {
            this._toggleView[i] = views[i];
        }
        if (!this._showToggle) {
            this.createToggleUI(x, y);
            this.enable();
        }
        this._showToggle = true;
    }




    private _toggleSprite: Sprite;
    private _toggletxt: Sprite;//checkBox
    private _checkBoxArray:Array<CheckBox> = [];
    private _toggleleftText: Text;

    private createToggleUI(x: number, y: number): void {
        var stat: Sprite = this._toggleSprite;
        var pixel: number = Browser.pixelRatio;
        if (!stat) {
            stat = new Sprite();
            this._toggleleftText = new Text();
            this._toggleleftText.pos(5, 5);
            this._toggleleftText.color = "#ffffff";
            stat.addChild(this._toggleleftText);

            this._toggletxt = new Sprite();
            this._toggletxt.pos(170 * pixel, 5);
            stat.addChild(this._toggletxt);
            this._toggleSprite = stat;
            this._checkBoxArray.length = 0;
        }

        stat.pos(x, y);

        var text: string = "";
        for (var i: number = 0; i < this._toggleView.length; i++) {
            var one: any = this._toggleView[i];
            text += one.title + "\n";
            //checkBox
            let checkBox = new CheckBox("defaultCheckBox");
            checkBox.selected = (Stat as any)[one.value];
            this._checkBoxArray.push(checkBox);
            checkBox.scale(StatUI._toggleSize,StatUI._toggleSize);
            this._toggletxt.addChild(checkBox);
            checkBox.pos(0, i * (StatUI._toggleSize+5));
        }
        this._toggleleftText.text = text;

        // //调整为合适大小和字体			
        var width: number = pixel * 138;
        var height: number = pixel * (this._toggleView.length * StatUI._fontSize) + 4;
        this._toggleleftText.fontSize = StatUI._fontSize * pixel;

        stat.size(width, height);
        stat.graphics.clear();
        stat.graphics.alpha(0.5);
        stat.graphics.drawRect(0, 0, width + 110, height + 10, "#999999");
        stat.graphics.alpha(2);
        Laya.stage.addChild(stat);
        this.loop();
    }

    private createUI(x: number, y: number): void {
        var stat: Sprite = this._sp;
        var pixel: number = Browser.pixelRatio;
        if (!stat) {
            stat = new Sprite();
            this._leftText = new Text();
            this._leftText.pos(5, 5);
            this._leftText.color = "#ffffff";
            stat.addChild(this._leftText);

            this._txt = new Text();
            this._txt.pos(171 * pixel, 5);
            this._txt.color = "#ffffff";
            stat.addChild(this._txt);
            this._sp = stat;
        }

        stat.pos(x, y);

        var text: string = "";
        for (var i: number = 0; i < this._view.length; i++) {
            var one: any = this._view[i];
            text += one.title + "\n";
        }
        this._leftText.text = text;

        //调整为合适大小和字体			
        var width: number = pixel * 138;
        var height: number = pixel * (this._view.length * StatUI._fontSize) + 4;
        this._txt.fontSize = StatUI._fontSize * pixel;
        this._leftText.fontSize = StatUI._fontSize * pixel;

        stat.size(width, height);
        stat.graphics.clear();
        stat.graphics.alpha(0.5);
        stat.graphics.drawRect(0, 0, width + 110, height + 10, "#999999");
        stat.graphics.alpha(2);
        this.loop();
    }

    /**
     * @override
     * 激活性能统计
     * */
    enable(): void {
        ILaya.systemTimer.frameLoop(1, this, this.loop);
    }

    /**
     * @override
     * 隐藏性能统计信息。
     */
    hide(): void {
        this._show = false;
        this._showToggle = false;
        ILaya.systemTimer.clear(this, this.loop);
        if (this._canvas) {
            Browser.removeElement(this._canvas.source);
        }
    }

    /**
     * @override
     * 点击性能统计显示区域的处理函数。
     */
    set_onclick(fn: (this: GlobalEventHandlers, ev: MouseEvent) => any): void {
        if (this._sp) {
            this._sp.on("click", this._sp, fn);
        }
        if (this._canvas) {
            this._canvas.source.onclick = fn;
            this._canvas.source.style.pointerEvents = '';
        }
    }

    /**
     * @private
     * 性能统计参数计算循环处理函数。
     */
    loop(): void {
        Stat._count++;
        var timer: number = Browser.now();
        if (timer - Stat._timer < 1000) return;

        var count: number = Stat._count;
        //计算更精确的FPS值
        Stat.FPS = Math.round((count * 1000) / (timer - Stat._timer));
        if (this._show) {
            Stat.updateEngineData();
            var delay: string = Stat.FPS > 0 ? Math.floor(1000 / Stat.FPS).toString() : " ";
            Stat._fpsStr = Stat.FPS + (Stat.renderSlow ? " slow" : "") + " " + delay;
            this.renderInfo(count);
            Stat.clear();
        }

        if (this._showToggle) {
            for (var i: number = 0; i < this._toggleView.length; i++) {
                let one = this._toggleView[i];
                (Stat as any)[one.value] = this._checkBoxArray[i].selected;
            }
        }

        Stat._count = 0;
        Stat._timer = timer;
    }

    private renderInfo(count: number): void {
        var text: string = "";
        for (var i: number = 0; i < this._view.length; i++) {
            let vieparam: StatUIParams = this._view[i];

            let isAverage: boolean = vieparam.mode == "average";

            // var one: any = this._view[i];
            var value: any = (Stat as any)[vieparam.value];
            (vieparam.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100);
            (vieparam.units == "K") && (value = Math.floor(value / (1024) * 100) / 100);

            if (isAverage) {
                value /= count;
                value = Math.floor(value);
            }

            (vieparam.units == "M") && (value += "M");
            (vieparam.units == "K") && (value += "K");
            text += value + "\n";
        }
        this._txt.text = text;
    }

    /**
     * @override
     * 非canvas模式的渲染
     * */
    renderNotCanvas(ctx: any, x: number, y: number) {
        this._show && this._sp && this._sp.render(ctx, 0, 0);
        //this._showToggle && this._toggleSprite && this._toggleSprite.render(ctx, 0, 0);
    }


}

