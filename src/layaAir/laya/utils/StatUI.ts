import { Laya } from "../../Laya";
import { Render2DProcessor } from "../display/Render2DProcessor";
import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { LayaGL } from "../layagl/LayaGL";
import { StatElement } from "../layagl/StatisticsContext";
import { IRender2DPass } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { Stat } from "./Stat";

interface StatUIParams {
    value: StatElement,//对应Stat的数据
    fractionDigits: number,//小数位数
    unit: "" | "M" | "ms" | "K" //显示单位
}

/** @ignore */
export class StatUI {
    _sp: Sprite;

    private _title: Text;
    private _txt: Text;
    private _items: Array<StatUIParams>;
    private _pass: IRender2DPass

    private createUI(): void {
        this._pass = LayaGL.render2DRenderPassFactory.createRender2DPass();
        let sp: Sprite = this._sp = new Sprite();
        this._pass.root = this._sp._struct;
        this._sp._struct.pass = this._pass;
        this._pass.doClearColor = false;

        sp.scale(Math.max(Laya.stage.clientScaleX, 1), Math.max(Laya.stage.clientScaleY, 1));
        Laya.stage.on(Event.RESIZE, this, () => {
            this._sp.scale(Math.max(Laya.stage.clientScaleX, 1), Math.max(Laya.stage.clientScaleY, 1));
        });

        let leftText = this._title = new Text();
        leftText.singleCharRender = false;
        leftText.pos(5, 5);
        leftText.color = "#ffffff";
        leftText.fontSize = fontSize;
        sp.addChild(leftText);

        let rightText = this._txt = new Text();
        rightText.singleCharRender = true;
        rightText.pos(100, 5);
        rightText.color = "#ffffff";
        rightText.fontSize = fontSize;
        sp.addChild(rightText);

        sp.graphics.clear();
        sp.graphics.alpha(0.5);
        sp.graphics.drawRect(0, 0, 1, 1, "#999999", null, null, true);
    }

    show(x?: number, y?: number): void {
        //转换为_view
        this._items = new Array();
        strArray.length = 0;
        // 根据StatisticsElement枚举的名字转换为StatUIParams，并去掉前缀
        for (let element of Stat.elements) {
            let name = StatElement[element];
            // 去掉前缀
            let title = name.replace(/^(T_|C_|M_|CT_)/, "").replace(/_/g, " ");
            // 解析单位和显示模式
            let unit: StatUIParams["unit"] = "";
            let fractionDigits = 3;
            if (name.startsWith("CT_") || name.startsWith("C_"))
                fractionDigits = 0;
            else if (name.startsWith("M_"))
                unit = "M";
            else if (name.startsWith("T_"))
                unit = "ms";
            this._items.push({
                value: element,
                fractionDigits,
                unit
            });
            strArray.push(title);
        }
        if (!this._sp)
            this.createUI();

        this._title.text = strArray.join("\n");
        this._txt.x = this._title.textWidth + 10;
        this._sp.size(this._title.textWidth + 100, this._title.textHeight + 10);
        this._sp.pos(x || 0, y || 0);
    }

    hide() {
        this._title.text = null;
        this._txt.text = null;
    }

    update(): void {
        strArray.length = 0;
        for (let i = 0; i < this._items.length; i++) {
            let item: StatUIParams = this._items[i];
            let datavalue = LayaGL.statAgent.getElementData(item.value);
            let str = datavalue.toFixed(item.fractionDigits).replace(digitPattern, '$1');
            if (str == "-0")
                str = "0";
            strArray.push(str + " " + item.unit);
        }
        this._txt.text = strArray.join("\n");
    }

    render() {
        this._pass && this._pass.fowardRender(Render2DProcessor.rendercontext2D);
    }
}

const fontSize: number = 16;
const strArray: Array<string> = [];
const digitPattern = /\.0*$|(\.\d*[1-9])0+$/;

Stat._statUIClass = StatUI;
