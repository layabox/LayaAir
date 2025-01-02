
import { ILaya } from "../../ILaya";
import { Event } from "../events/Event";
import { InputManager } from "../events/InputManager";
import { Point } from "../maths/Point";
import { PopupDirection } from "./Const";
import { GRoot } from "./GRoot";
import { UIConfig2 } from "./UIConfig";
import { GWidget } from "./GWidget";
import { GWindow } from "./GWindow";
import { Sprite } from "../display/Sprite";

const popupTargetKey = Symbol("popupTarget");

export class PopupManager {
    private _owner: GRoot;
    private _popupStack: GWidget[];
    private _justClosedPopups: GWidget[];
    private _tooltipWin: GWidget;
    private _defaultTooltipWin: GWidget;

    constructor(owner: GRoot) {
        this._owner = owner;

        this._popupStack = [];
        this._justClosedPopups = [];

        InputManager.onMouseDownCapture.add(this._touchBegin, this);
        ILaya.stage.on(Event.BLUR, this, this.checkPopups);
    }

    public showPopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): void {
        if (this._popupStack.length > 0) {
            let k = this._popupStack.indexOf(popup);
            if (k != -1) {
                for (let i = this._popupStack.length - 1; i >= k; i--)
                    this._owner.removeChild(this._popupStack.pop());
            }
        }
        this._popupStack.push(popup);

        if (target) {
            let p: Sprite = target;
            while (p) {
                if (p.parent == this._owner) {
                    if (popup.zOrder < p.zOrder) {
                        popup.zOrder = p.zOrder;
                    }
                    break;
                }
                p = p.parent;
            }
        }

        (<any>popup)[popupTargetKey] = target;

        this._owner.addChild(popup);
        this._owner.adjustModalLayer();
        this.validatePopupPosition(popup, target, dir);
    }

    public validatePopupPosition(popup: GWidget, target: GWidget, dir: PopupDirection, offsetX?: number, offsetY?: number) {
        let px: number, py: number;
        let sizeW: number = 0, sizeH: number = 0;
        if (offsetX == null) offsetX = 0;
        if (offsetY == null) offsetY = 0;
        if (target) {
            let pos = target.localToGlobal(Point.TEMP.setTo(0, 0));
            px = pos.x;
            py = pos.y;
            let size = target.localToGlobal(Point.TEMP.setTo(target.width, target.height));
            sizeW = size.x - px;
            sizeH = size.y - py;
        }
        else {
            let pos = this._owner.globalToLocal(Point.TEMP.copy(InputManager.getTouchPos()));
            px = pos.x;
            py = pos.y;
        }
        let xx: number, yy: number;
        xx = px + offsetX;
        if (xx + popup.width > this._owner.width)
            xx = px + sizeW - popup.width - offsetX;
        yy = py + sizeH + offsetY;
        if (((dir === undefined || dir === PopupDirection.Auto) && yy + popup.height > this._owner.height)
            || dir === PopupDirection.Up) {
            yy = py - popup.height - offsetY - 1;
            if (yy < 0) {
                yy = 0;
                xx += sizeW / 2;
                if (xx + popup.width > this._owner.width)
                    xx = this._owner.width - popup.width;
            }
        }

        popup.pos(xx, yy);
    }

    public togglePopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): boolean {
        if (this._justClosedPopups.indexOf(popup) != -1)
            return false;

        this.showPopup(popup, target, dir);
        return true;
    }

    public hidePopup(popup?: GWidget): void {
        if (popup) {
            let k = this._popupStack.indexOf(popup);
            if (k != -1) {
                for (let i = this._popupStack.length - 1; i >= k; i--)
                    this.closePopup(this._popupStack.pop());
            }
        }
        else {
            let cnt = this._popupStack.length;
            for (let i = cnt - 1; i >= 0; i--)
                this.closePopup(this._popupStack[i]);
            this._popupStack.length = 0;
        }
    }

    public get hasAnyPopup(): boolean {
        return this._popupStack.length != 0;
    }

    public isPopupJustClosed(popup: GWidget) {
        return this._justClosedPopups.indexOf(popup) != -1;
    }

    private closePopup(popup: GWidget): void {
        if (popup.parent) {
            if (popup instanceof GWindow)
                popup.hide();
            else
                this._owner.removeChild(popup);
        }

        // let focus: GWidget = (<any>popup)[popupTargetKey];
        // if (focus && !focus.destroyed && focus.displayedInStage)
        //     this._owner.inputMgr.setFocus(focus, true);
    }

    public showTooltips(msg: string, delay?: number) {
        if (this._defaultTooltipWin == null) {
            if (!UIConfig2.tooltipsWidget) {
                console.warn("UIConfig.tooltipsWin not defined");
                return;
            }

            this._defaultTooltipWin = <GWidget>UIConfig2.tooltipsWidget.create();
            this._defaultTooltipWin.mouseEnabled = false;
        }

        this._defaultTooltipWin.text = msg;
        this.showTooltipsWin(this._defaultTooltipWin, delay);
    }

    public showTooltipsWin(tooltipWin: GWidget, delay?: number): void {
        this.hideTooltips();

        this._tooltipWin = tooltipWin;
        if (delay != null && delay != 0)
            ILaya.timer.once(delay, this, this._doShowTooltips);
        else
            this._doShowTooltips();
    }

    private _doShowTooltips(): void {
        if (this._tooltipWin == null)
            return;

        this.validatePopupPosition(this._tooltipWin, null, PopupDirection.Auto, 10, 20);
        this._owner.addChild(this._tooltipWin);
    }

    public hideTooltips(): void {
        if (this._tooltipWin) {
            if (this._tooltipWin.parent)
                this._owner.removeChild(this._tooltipWin);
            this._tooltipWin = null;
        }
    }

    public checkPopups(): void {
        this._justClosedPopups.length = 0;

        if (this._popupStack.length > 0) {
            let gobj = InputManager.touchTarget;
            let handled = false;
            while (gobj) {
                let k = this._popupStack.indexOf(<GWidget>gobj);
                if (k != -1) {
                    for (let i = this._popupStack.length - 1; i > k; i--) {
                        let last = this._popupStack.length - 1;
                        let popup: GWidget = this._popupStack[last];

                        this.closePopup(popup);
                        this._justClosedPopups.push(popup);
                        this._popupStack.splice(last, 1);
                    }
                    handled = true;
                    break;
                }
                gobj = gobj.parent;
            }

            if (!handled) {
                for (let i = this._popupStack.length - 1; i >= 0; i--) {
                    let popup = this._popupStack[i];
                    this.closePopup(popup);
                    this._justClosedPopups.push(popup);
                    this._popupStack.splice(i, 1);
                }
            }
        }
    }

    private _touchBegin(): void {
        if (this._tooltipWin)
            this.hideTooltips();

        this.checkPopups();
    }
}