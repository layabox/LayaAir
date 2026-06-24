import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { NodeFlags } from "../Const";
import { Render2DProcessor } from "../display/Render2DProcessor";
import { Sprite } from "../display/Sprite";
import { SpriteConst, TransformKind } from "../display/SpriteConst";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { LayaGL } from "../layagl/LayaGL";
import { StatElement } from "../layagl/StatisticsContext";
import { IRender2DPass } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { Browser } from "./Browser";
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

        let leftText = this._title = new Text();
        leftText.pos(5, 5);
        leftText.color = "#ffffff";
        leftText.name = "title";
        sp.addChild(leftText);

        let rightText = this._txt = new Text();
        rightText.singleCharRender = true;
        rightText.pos(100, 5);
        rightText.color = "#ffffff";
        rightText.name = "txt";
        sp.addChild(rightText);

        sp.graphics.clear();
        sp.graphics.alpha(0.5);
        sp.graphics.drawRect(0, 0, 1, 1, "#999999", null, null, true);

        Laya.stage.on(Event.RESIZE, this, this.updateSize);
    }

    private updateSize() {
        let fontSize = Browser.onMobile ? 10 : 12; //手机dpi一般比较高，字体可以相对小一些
        fontSize = Math.max(fontSize, fontSize / (Laya.stage._canvasTransform.getScaleX() * Laya.stage.clientScaleX));

        this._txt.fontSize = fontSize;
        this._title.fontSize = fontSize;

        this._txt.x = this._title.textWidth + 10;
        this._sp.size(this._title.textWidth + fontSize * 8, this._title.textHeight + 10);

        this._sp._globalTrans._spTransChanged(TransformKind.TRS);
    }

    private _displayChild(node: Sprite, display: boolean): void {
        for (let child of node._children) {
            if (child._children.length > 0) {
                this._displayChild(child, display);
            } else {
                child._setDisplay(display);
            }
        }
        node._setDisplay(display);
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
        this._sp.pos(x || 0, y || 0);
        // 验证通过
        this._sp._parent = Laya.stage;
        this._sp._syncTransParent(); // 直接改 _parent 绕过了 _setParent，需手动同步 SoA 的 parent
        this.updateSize();
        this._displayChild(this._sp, true);
    }

    hide() {
        if (!this._sp) return;

        this._title.text = null;
        this._txt.text = null;

        this._sp._parent = null;
        this._sp._syncTransParent(); // 同步 SoA parent(置为 root)
        this._displayChild(this._sp, false);
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
        this._pass && this._pass.fowardRender(Render2DProcessor.rendercontext2D, Render2DProcessor.renderTime);
    }
}

const strArray: Array<string> = [];
const digitPattern = /\.0*$|(\.\d*[1-9])0+$/;

Stat._statUIClass = StatUI;
