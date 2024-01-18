
import { Laya } from "../../Laya";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { Texture2D } from "../resource/Texture2D";
import { CheckBox } from "../ui/CheckBox";
import { IStatUI, StatToggleUIParams, StatUIParams } from "../utils/IStatUI";
import { Stat } from "../utils/Stat";

export class StatUI implements IStatUI {

    /**@internal */
    private _txt: Text;
    /**@internal */
    private _sp: Sprite;
    /**@internal */
    private _view: Array<StatUIParams>;
    /**@internal */
    private _toggleView: Array<StatToggleUIParams>;
    /**@internal */
    private _toggleSprite: Sprite;
    /**@internal */
    private _checkBoxArray: Array<CheckBox>;
    /**@internal */
    private _show = false;
    /**@internal */
    private _showToggle = false;

    /**@internal */
    private createUI(): void {
        let sp: Sprite = this._sp = new Sprite();
        sp.scale(Math.max(Laya.stage.clientScaleX, 1), Math.max(Laya.stage.clientScaleY, 1));
        Laya.stage.on(Event.RESIZE, this, () => {
            this._sp.scale(Math.max(Laya.stage.clientScaleX, 1), Math.max(Laya.stage.clientScaleY, 1));
        });

        let leftText = new Text();
        leftText.pos(5, 5);
        leftText.color = "#ffffff";
        leftText.fontSize = fontSize;
        sp.addChild(leftText);

        strArray.length = 0;
        for (let one of this._view)
            strArray.push(one.title);
        leftText.text = strArray.join("\n");

        this._txt = new Text();
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

    /**@internal */
    private createToggleUI(): void {
        if (!checkBoxTex) {
            let pixels = new Uint8Array(9);
            pixels[0] = 255;
            pixels[1] = 255;
            pixels[2] = 255;
            pixels[3] = 255;
            pixels[4] = 255;
            pixels[5] = 128;
            pixels[6] = 128;
            pixels[7] = 128;
            pixels[8] = 0;
            checkBoxTex = new Texture2D(1, 3, TextureFormat.R8G8B8, false, false);
            checkBoxTex.setPixelsData(pixels, false, false);
            checkBoxTex.lock = true;//锁住资源防止被资源管理释放
            checkBoxTex.name = "StatUICheckBox";
            Loader.cacheRes(checkBoxTex.name, checkBoxTex, Loader.TEXTURE2D);
        }

        let sp = this._toggleSprite = new Sprite();
        sp.zOrder = 1000000;
        let leftText = new Text();
        leftText.pos(5, 5);
        leftText.color = "#ffffff";
        leftText.fontSize = fontSize;
        sp.addChild(leftText);

        leftText.text = Text._testWord;
        let h = leftText.textHeight + leftText.leading;

        strArray.length = 0;
        for (let one of this._toggleView)
            strArray.push(one.title);
        leftText.text = strArray.join("\n");

        let toggles = new Sprite();
        toggles.pos(leftText.textWidth + 15, 5);
        sp.addChild(toggles);

        this._checkBoxArray = [];
        for (let i = 0; i < this._toggleView.length; i++) {
            let one = this._toggleView[i];

            let cb = new CheckBox(checkBoxTex.name);
            cb.selected = (Stat as any)[one.value];
            cb.scale(12, 12);
            cb.pos(0, i * h + 2);
            cb.size(12, 12);
            toggles.addChild(cb);
            this._checkBoxArray.push(cb);
        }

        sp.size(leftText.textWidth + 40, leftText.textHeight + 10);
        sp.graphics.clear();
        sp.graphics.alpha(0.5);
        sp.graphics.drawRect(0, 0, sp.width, sp.height, "#999999");
        sp.graphics.alpha(2);
    }

    /**
     * @override
     * 显示性能统计信息。
     * @param	x X轴显示位置。
     * @param	y Y轴显示位置。
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

    showToggle(x?: number, y?: number, views?: Array<StatToggleUIParams>) {
        x = x || 0;
        y = y || 0;
        views = views || Stat.AllToggle;

        this._toggleView = views;
        this._showToggle = true;

        if (!this._toggleSprite)
            this.createToggleUI();

        Laya.stage.addChild(this._toggleSprite);
        this._toggleSprite.pos(x, y);
    }

    /**
    * @override
    * 隐藏性能统计信息。
    */
    hide(): void {
        this._show = false;
        this._showToggle = false;
        if (this._toggleSprite)
            this._toggleSprite.removeSelf();
    }

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

        if (this._showToggle) {
            for (let i = 0; i < this._toggleView.length; i++) {
                let one = this._toggleView[i];
                (Stat as any)[one.value] = this._checkBoxArray[i].selected;
            }
        }
    }

    render(ctx: any, x: number, y: number) {
        this._show && this._sp && this._sp.render(ctx, 0, 0);
    }
}

const fontSize: number = 16;
const strArray: Array<string> = [];
var checkBoxTex: Texture2D;