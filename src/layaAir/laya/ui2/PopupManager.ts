
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
import { Loader } from "../net/Loader";

const popupTargetKey = Symbol("popupTarget");

/**
 * @blueprintIgnore
 */
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

    /**
     * @zh Shows a widget that automatically hides when clicking outside the widget on the stage.
     * @param popup The widget to be displayed as a popup.
     * @param target The target widget relative to which the popup will be positioned.
     * @param dir The direction in which the popup should appear relative to the target. 
     * @en 显示一个界面，并且点击舞台其他区域时自动隐藏该组件。
     * @param popup 要显示的弹出界面。
     * @param target 弹出界面相对于此目标组件定位。
     * @param dir 弹出界面相对于目标组件出现的方向。
     */
    showPopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): void {
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

    /**
     * @en Validates and adjusts the position of the popup widget.
     * The popup will be positioned relative to the target widget, considering the specified direction and offsets. The popup won’t overflow the stage boundaries.
     * @param popup The popup widget to be positioned.
     * @param target The target widget relative to which the popup will be positioned. 
     * @param dir The direction in which the popup should appear relative to the target. 
     * @param offsetX Additional horizontal offset for the popup position.
     * @param offsetY Additional vertical offset for the popup position.
     * @zh 验证并调整弹出组件的位置。
     * 弹出组件将相对于目标组件定位，考虑指定的方向和偏移量。弹出组件不会超出舞台边界。
     * @param popup 要定位的弹出组件。
     * @param target 弹出组件相对于此目标组件定位。
     * @param dir 弹出组件相对于目标组件出现的方向。
     * @param offsetX 额外的水平偏移量，用于调整弹出组件的位置。 
     * @param offsetY 额外的垂直偏移量，用于调整弹出组件的位置。
     */
    validatePopupPosition(popup: GWidget, target: GWidget, dir: PopupDirection, offsetX?: number, offsetY?: number) {
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

    /**
     * @en Toggles the visibility of a popup widget.
     * If the popup is already open, it will be closed. If it is closed, it will be shown.
     * @param popup The popup widget to be toggled.
     * @param target The target widget relative to which the popup will be positioned.
     * @param dir The direction in which the popup should appear relative to the target. 
     * @return Returns true if the popup was shown, false if it was closed.
     * @zh 切换弹出组件的可见性。
     * 如果弹出组件已经打开，则将其关闭；如果它是关闭的，则将其显示。
     * @param popup 要切换的弹出组件。
     * @param target 弹出组件相对于此目标组件定位。 
     * @param dir 弹出组件相对于目标组件出现的方向。 
     * @returns 如果弹出组件被显示则返回 true，如果被关闭则返回 false。
     */
    togglePopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): boolean {
        if (this._justClosedPopups.indexOf(popup) != -1)
            return false;

        this.showPopup(popup, target, dir);
        return true;
    }

    /**
     * @en Hides a specific popup widget or all popups if no widget is specified.
     * @param popup The popup widget to be hidden. If not provided, all popups will be hidden.
     * @zh 隐藏特定的弹出组件，或者如果未指定组件则隐藏所有弹出组件。
     * @param popup 要隐藏的弹出组件。如果未提供，则隐藏所有弹出组件。 
     */
    hidePopup(popup?: GWidget): void {
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

    /**
     * @en Indicates whether there are any popups currently displayed.
     * @zh 指示当前是否有任何弹出组件被显示。
     */
    get hasAnyPopup(): boolean {
        return this._popupStack.length != 0;
    }

    /**
     * @en Checks if a specific popup widget was just closed.
     * @param popup The popup widget to check.
     * @return Returns true if the popup was just closed, false otherwise.
     * @zh 检查特定的弹出组件是否刚刚被关闭。
     * @param popup 要检查的弹出组件。
     * @returns 如果弹出组件刚刚被关闭则返回 true，否则返回 false。
     */
    isPopupJustClosed(popup: GWidget) {
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

    /**
     * @en Shows a tooltip with the specified message after an optional delay.
     * @param msg The message to be displayed in the tooltip. 
     * @param delay The delay in milliseconds before showing the tooltip. 
     * @returns Returns the default tooltip widget used for displaying the message.
     * @zh 显示一个工具提示，显示指定的消息，并可选择延迟显示。
     * @param msg 要在工具提示中显示的消息。 
     * @param delay 显示工具提示前的延迟时间（毫秒）。 
     * @returns 返回用于显示消息的默认工具提示组件。 
     */
    showTooltips(msg: string, delay?: number) {
        if (this._defaultTooltipWin == null) {
            if (!UIConfig2.tooltipsWidget) {
                console.warn("UIConfig.tooltipsWidget not defined");
                return;
            }

            this._defaultTooltipWin = <GWidget>Loader.createNodes(UIConfig2.tooltipsWidget);
            this._defaultTooltipWin.mouseEnabled = false;
        }

        this._defaultTooltipWin.text = msg;
        this.showTooltipsWin(this._defaultTooltipWin, delay);
    }

    /**
     * @en Shows a specified tooltip widget after an optional delay.
     * @param tooltipWin The tooltip widget to be displayed.
     * @param delay The delay in milliseconds before showing the tooltip.
     * @zh 显示一个指定的工具提示组件，并可选择延迟显示。
     * @param tooltipWin 要显示的工具提示组件。 
     * @param delay 显示工具提示前的延迟时间（毫秒）。 
     */
    showTooltipsWin(tooltipWin: GWidget, delay?: number): void {
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

    /**
     * @en Hides the currently displayed tooltip, if any.
     * @zh 隐藏当前显示的工具提示（如果有的话）。
     */
    hideTooltips(): void {
        if (this._tooltipWin) {
            if (this._tooltipWin.parent)
                this._owner.removeChild(this._tooltipWin);
            this._tooltipWin = null;
        }
    }

    /** @ignore @blueprintIgnore */
    checkPopups(): void {
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