import { Graphics } from "../display/Graphics"
import { Sprite } from "../display/Sprite"
import { Text } from "../display/Text"
import { Event } from "../events/Event"
import { Rectangle } from "../maths/Rectangle"
import { UIComponent } from "./UIComponent"
import { UIEvent } from "./UIEvent"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**鼠标提示管理类*/
export class TipManager extends UIComponent {
    static offsetX: number = 10;
    static offsetY: number = 15;
    static tipTextColor: string = "#ffffff";
    static tipBackColor: string = "#111111";
    static tipDelay: number = 200;
    private _tipBox: UIComponent;
    private _tipText: Text;
    private _defaultTipHandler: Function;

    constructor() {
        super();
        this._tipBox = new UIComponent();
        this._tipBox.addChild(this._tipText = new Text());
        this._tipText.x = this._tipText.y = 5;
        this._tipText.color = TipManager.tipTextColor;
        this._defaultTipHandler = this._showDefaultTip;
        ILaya.stage.on(UIEvent.SHOW_TIP, this, this._onStageShowTip);
        ILaya.stage.on(UIEvent.HIDE_TIP, this, this._onStageHideTip);
        this.zOrder = 1100
    }

    /**
     * @private
     */
    private _onStageHideTip(e: any): void {
        ILaya.timer.clear(this, this._showTip);
        this.closeAll();
        this.removeSelf();
    }

    /**
     * @private
     */
    private _onStageShowTip(data: any): void {
        ILaya.timer.once(TipManager.tipDelay, this, this._showTip, [data], true);
    }

    /**
     * @private
     */
    private _showTip(tip: any): void {
        if (typeof (tip) == 'string') {
            var text: string = String(tip);
            if (Boolean(text)) {
                this._defaultTipHandler(text);
            }
        } else if (tip instanceof Handler) {
            ((<Handler>tip)).run();
        } else if (tip instanceof Function) {
            tip.apply();
        }
        if (true) {
            ILaya.stage.on(Event.MOUSE_MOVE, this, this._onStageMouseMove);
            ILaya.stage.on(Event.MOUSE_DOWN, this, this._onStageMouseDown);
        }

        this._onStageMouseMove(null);
    }

    /**
     * @private
     */
    private _onStageMouseDown(e: Event): void {
        this.closeAll();
    }

    /**
     * @private
     */
    private _onStageMouseMove(e: Event): void {
        this._showToStage(this, TipManager.offsetX, TipManager.offsetY);
    }

    /**
     * @private
     */
    private _showToStage(dis: Sprite, offX: number = 0, offY: number = 0): void {
        var rec: Rectangle = dis.getBounds();
        dis.x = ILaya.stage.mouseX + offX;
        dis.y = ILaya.stage.mouseY + offY;
        if (dis._x + rec.width > ILaya.stage.width) {
            dis.x -= rec.width + offX;
        }
        if (dis._y + rec.height > ILaya.stage.height) {
            dis.y -= rec.height + offY;
        }
    }

    /**关闭所有鼠标提示*/
    closeAll(): void {
        ILaya.timer.clear(this, this._showTip);
        ILaya.stage.off(Event.MOUSE_MOVE, this, this._onStageMouseMove);
        ILaya.stage.off(Event.MOUSE_DOWN, this, this._onStageMouseDown);
        this.removeChildren();
    }

    /**
     * 显示显示对象类型的tip
     */
    showDislayTip(tip: Sprite): void {
        this.addChild(tip);
        this._showToStage(this);
        ILaya.stage.addChild(this);
    }

    /**
     * @private
     */
    private _showDefaultTip(text: string): void {
        this._tipText.text = text;
        var g: Graphics = this._tipBox.graphics;
        g.clear(true);
        g.drawRect(0, 0, this._tipText.width + 10, this._tipText.height + 10, TipManager.tipBackColor);
        this.addChild(this._tipBox);
        this._showToStage(this);
        ILaya.stage.addChild(this);
    }

    /**默认鼠标提示函数*/
    get defaultTipHandler(): Function {
        return this._defaultTipHandler;
    }

    set defaultTipHandler(value: Function) {
        this._defaultTipHandler = value;
    }
}

ILaya.regClass(TipManager);
ClassUtils.regClass("laya.ui.TipManager", TipManager);
ClassUtils.regClass("Laya.TipManager", TipManager);