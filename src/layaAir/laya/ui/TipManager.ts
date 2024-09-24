import { Graphics } from "../display/Graphics"
import { Sprite } from "../display/Sprite"
import { Text } from "../display/Text"
import { Event } from "../events/Event"
import { Rectangle } from "../maths/Rectangle"
import { UIComponent } from "./UIComponent"
import { UIEvent } from "./UIEvent"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";

/**
 * @en Mouse Tip Management Class
 * @zh 鼠标提示管理类
 */
export class TipManager extends UIComponent {
    /**
     * @en X-axis offset of the tooltip
     * @zh 提示框X轴偏移量
     */
    static offsetX: number = 10;
    /**
     * @en Y-axis offset of the tooltip
     * @zh 提示框Y轴偏移量
     */
    static offsetY: number = 15;
    /**
     * @en Text color of the tooltip
     * @zh 提示文本颜色
     */
    static tipTextColor: string = "#ffffff";
    /**
     * @en Background color of the tooltip
     * @zh 提示框背景颜色
     */
    static tipBackColor: string = "#111111";
    /**
     * @en Delay before showing the tooltip
     * @zh 显示提示框前的延迟时间
     */
    static tipDelay: number = 200;
    private _tipBox: UIComponent;
    private _tipText: Text;
    private _defaultTipHandler: Function;

    /**
     * @en Default mouse prompt function
     * @zh 默认鼠标提示函数
     */
    get defaultTipHandler(): Function {
        return this._defaultTipHandler;
    }

    set defaultTipHandler(value: Function) {
        this._defaultTipHandler = value;
    }

    /** @ignore */
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

    private _onStageHideTip(e: any): void {
        ILaya.timer.clear(this, this._showTip);
        this.closeAll();
        this.removeSelf();
    }

    private _onStageShowTip(data: any): void {
        ILaya.timer.once(TipManager.tipDelay, this, this._showTip, [data], true);
    }

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

    private _onStageMouseDown(e: Event): void {
        this.closeAll();
    }

    private _onStageMouseMove(e: Event): void {
        this._showToStage(this, TipManager.offsetX, TipManager.offsetY);
    }


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

    private _showDefaultTip(text: string): void {
        this._tipText.text = text;
        var g: Graphics = this._tipBox.graphics;
        g.clear(true);
        g.drawRect(0, 0, this._tipText.width + 10, this._tipText.height + 10, TipManager.tipBackColor);
        this.addChild(this._tipBox);
        this._showToStage(this);
        ILaya.stage.addChild(this);
    }

    /**
     * @en Closes all tooltips and removes event listeners related to mouse actions.
     * @zh 关闭所有鼠标提示并移除与鼠标动作相关的事件监听器。
     */
    closeAll(): void {
        ILaya.timer.clear(this, this._showTip);
        ILaya.stage.off(Event.MOUSE_MOVE, this, this._onStageMouseMove);
        ILaya.stage.off(Event.MOUSE_DOWN, this, this._onStageMouseDown);
        this.removeChildren();
    }

    /**
     * @en Displays a tooltip Sprite on the stage.
     * @param tip The Sprite object to be displayed as a tooltip.
     * @zh 显示对象提示条的显示。
     * @param tip 要显示的提示条精灵对象。
     */

    showDislayTip(tip: Sprite): void {
        this.addChild(tip);
        this._showToStage(this);
        ILaya.stage.addChild(this);
    }
}