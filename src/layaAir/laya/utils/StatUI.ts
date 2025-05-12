
import { Laya } from "../../Laya";
import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { LayaGL } from "../layagl/LayaGL";
import { IRender2DPass } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { Render2DSimple } from "../renders/Render2D";
import { Stat, StatUIParams } from "./Stat";

export class StatUI {
    private _txt: Text;
    private _sp: Sprite;
    private _view: Array<StatUIParams>;
    private _show = false;
    private _pass : IRender2DPass

    private createUI(): void {
        this._pass = LayaGL.render2DRenderPassFactory.createRender2DPass();
        let sp: Sprite = this._sp = new Sprite();
        this._pass.root = this._sp._struct;
        this._pass.doClearColor = false;
        
        sp.scale(Math.max(Laya.stage.clientScaleX, 1), Math.max(Laya.stage.clientScaleY, 1));
        Laya.stage.on(Event.RESIZE, this, () => {
            this._sp.scale(Math.max(Laya.stage.clientScaleX, 1), Math.max(Laya.stage.clientScaleY, 1));
        });

        let leftText = new Text();
        leftText.singleCharRender = true;
        leftText.pos(5, 5);
        leftText.color = "#ffffff";
        leftText.fontSize = fontSize;
        sp.addChild(leftText);

        strArray.length = 0;
        for (let one of this._view)
            strArray.push(one.title);
        leftText.text = strArray.join("\n");

        this._txt = new Text();
        this._txt.singleCharRender = true;
        this._txt.pos(leftText.textWidth + 10, 5);
        this._txt.color = "#ffffff";
        this._txt.fontSize = fontSize;
        sp.addChild(this._txt);

        sp.size(leftText.textWidth + 100, leftText.textHeight + 10);
        sp.graphics.clear();
        sp.graphics.alpha(0.5);
        sp.graphics.drawRect(0, 0, sp.width, sp.height, "#999999");
        sp.graphics.alpha(2);
    }

    /**
     * @en Display the performance statistics.
     * @param x The X-axis display position. 
     * @param y The Y-axis display position.
     * @param views The UI parameter array for displaying statistics.
     * @zh 显示性能统计信息。
     * @param x X轴显示位置。
     * @param y Y轴显示位置。
     * @param views 用于显示统计信息的UI参数数组。
     */
    show(x?: number, y?: number, views?: Array<StatUIParams>): void {
        x = x || 0;
        y = y || 0;
        views = views || Stat.AllShow;

        this._view = views;
        this._show = true;

        if (!this._sp)
            this.createUI();
        this._sp.pos(x, y);
    }

    /**
     * @en Hides performance statistics.
     * @zh 隐藏性能统计信息。
     */
    hide(): void {
        this._show = false;
    }

    /**
     * @en Update the performance statistics.
     * @zh 更新性能统计信息。
     */
    update(): void {
        if (this._show) {
            strArray.length = 0;
            for (let i = 0; i < this._view.length; i++) {
                let item: StatUIParams = this._view[i];
                let isAverage: boolean = item.mode == "average";

                let value: any = (Stat as any)[item.value];
                (item.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100);
                (item.units == "K") && (value = Math.floor(value / (1024) * 100) / 100);

                if (isAverage) {
                    value /= Stat._count;
                    value = Math.floor(value);
                }

                (item.units == "M") && (value += "M");
                (item.units == "K") && (value += "K");

                strArray.push(value);
            }
            this._txt.text = strArray.join("\n");
        }
    }

    /**
     * @en Render the performance statistics.
     * @param ctx The rendering context.
     * @param x The X-axis render position.
     * @param y The Y-axis render position.
     * @zh 渲染性能统计信息。
     * @param ctx 渲染上下文。
     * @param x X轴显示位置。
     * @param y Y轴显示位置。
     */
    render(x: number, y: number) {
        this._show && this._pass && this._pass.fowardRender(Render2DSimple.rendercontext2D);
    }
}

const fontSize: number = 16;
const strArray: Array<string> = [];

Stat._statUIClass = StatUI;