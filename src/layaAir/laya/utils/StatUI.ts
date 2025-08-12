
import { PlayerConfig } from "../../Config";
import { Laya } from "../../Laya";
import { Render2DProcessor } from "../display/Render2DProcessor";
import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { LayaGL } from "../layagl/LayaGL";
import { StatisticsElement } from "../layagl/StatisticsContext";
import { IRender2DPass } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { Stat, StatUIParams, StatUnit } from "./Stat";

export class StatUI {
    private _txt: Text;
    private _sp: Sprite;
    private _view: Array<StatUIParams>;
    private _show = false;
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

        let leftText = new Text();
        leftText.singleCharRender = false;
        leftText.pos(5, 5);
        leftText.color = "#ffffff";
        leftText.fontSize = fontSize;
        sp.addChild(leftText);

        strArray.length = 0;
        strArray.push("FPS:");
        strArray.push("FPS Time:");
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
    show(x?: number, y?: number, views?: Array<StatisticsElement>): void {
        const statEnum = PlayerConfig.statEnum;
        if(statEnum){
            Stat.ShowStatArray.length = 0;
            for (let k in statEnum) {
                if (statEnum[k]) {
                    Stat.ShowStatArray.push(StatisticsElement[k as keyof typeof StatisticsElement]);
                }
            }
        }
        x = x || 0;
        y = y || 0;
        views = views || Stat.ShowStatArray;

        //转换为_view
        this._view = new Array();
        // 根据StatisticsElement枚举的名字转换为StatUIParams，并去掉前缀
        for (let i = 0; i < views.length; i++) {
            let element = views[i];
            let name = StatisticsElement[element];
            // 去掉前缀
            let title = name.replace(/^(T_|C_|M_|CT_)/, "");
            // 解析单位和显示模式
            let units = "";
            let mode: "normal" | "average" = "normal";
            if (name.startsWith("M_")) {
                units = "M";
            }
            if (name.startsWith("T_")) {
                units = "ms";
            }
            if (name.startsWith("CT_") || name.startsWith("C_")) {
                units = "int";
            }
            this._view.push({
                title: title,
                value: element,
                units: units as StatUnit,
                color: "white"
            });
        }
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
            // 先输出T_FPS_Frame和T_FPS_Time
            let fps = LayaGL.statAgent.getElementData(StatisticsElement.T_FPS_Frame);
            let fpsTime = LayaGL.statAgent.getElementData(StatisticsElement.T_FPS_Time);
            strArray.push(fps.toString());
            strArray.push(fpsTime.toFixed(3) + "ms");
            for (let i = 0; i < this._view.length; i++) {
                let item: StatUIParams = this._view[i];
                let datavalue = LayaGL.statAgent.getElementData(item.value);
                if (item.units === "int") {
                    // 保留三位小数
                    strArray.push(Math.floor(datavalue).toString());
                } else {
                    strArray.push(datavalue.toFixed(3) + item.units);
                }
            }
            this._txt.text = strArray.join("\n");
        }
    }

    /** @internal */
    render() {
        this._show && this._pass && this._pass.fowardRender(Render2DProcessor.rendercontext2D);
    }
}

const fontSize: number = 16;
const strArray: Array<string> = [];

Stat._statUIClass = StatUI;