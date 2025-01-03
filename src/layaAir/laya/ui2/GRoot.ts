import { ILaya } from "../../ILaya";
import { Event } from "../events/Event";
import { PopupDirection, RelationType } from "./Const";
import { PopupManager } from "./PopupManager";
import { UIConfig2 } from "./UIConfig";
import { GWidget } from "./GWidget";
import { GWindow } from "./GWindow";
import { Loader } from "../net/Loader";

export class GRoot extends GWidget {
    private _modalLayer: GWidget;
    private _modalWaitPane: GWidget;
    private _popupMgr: PopupManager;

    static LAYER = 1000;

    static get inst(): GRoot {
        return GWidget._defaultRoot ?? (GWidget._defaultRoot = new GRoot());
    }

    constructor() {
        super();

        this.zOrder = GRoot.LAYER;
        this.mouseThrough = true;
        this.size(ILaya.stage.width, ILaya.stage.height);
        ILaya.stage.addChild(this);

        this._popupMgr = new PopupManager(this);

        this._modalLayer = new GWidget();
        this._modalLayer.mouseEnabled = true;
        this._modalLayer.size(this.width, this.height);
        this._modalLayer.graphics.drawRect(0, 0, 1, 1, UIConfig2.modalLayerColor, null, 0, true);
        this._modalLayer.addRelation(this, RelationType.Size);

        ILaya.stage.on(Event.RESIZE, () => {
            this.size(ILaya.stage.width, ILaya.stage.height);
        });
    }

    get popupMgr(): PopupManager {
        return this._popupMgr;
    }

    showWindow(win: GWindow): void {
        this.addChild(win);

        if (win.x > this.width)
            win.x = this.width - win.width;
        else if (win.x + win.width < 0)
            win.x = 0;

        if (win.y > this.height)
            win.y = this.height - win.height;
        else if (win.y + win.height < 0)
            win.y = 0;

        this.adjustModalLayer();
    }

    hideWindow(win: GWindow): void {
        win.hide();
    }

    hideWindowImmediately(win: GWindow): void {
        if (win.parent == this)
            this.removeChild(win);

        this.adjustModalLayer();
    }

    bringToFront(win: GWindow): void {
        let cnt = this.numChildren;
        let i: number;
        if (this._modalLayer.parent && !win.modal)
            i = this.getChildIndex(this._modalLayer) - 1;
        else
            i = cnt - 1;

        for (; i >= 0; i--) {
            let g = this.getChildAt(i);
            if (g == win)
                return;
            if (g instanceof GWindow)
                break;
        }

        if (i >= 0)
            this.setChildIndex(win, i);
    }

    showModalWait(msg?: string) {
        if (UIConfig2.globalModalWaiting) {
            if (this._modalWaitPane == null)
                this._modalWaitPane = Loader.createNodes(UIConfig2.globalModalWaiting);
            this._modalWaitPane.size(this.width, this.height);
            this._modalWaitPane.addRelation(this, RelationType.Size);

            this.addChild(this._modalWaitPane);
            this._modalWaitPane.text = msg || "";
        }
    }

    closeModalWait(): void {
        if (this._modalWaitPane && this._modalWaitPane.parent)
            this.removeChild(this._modalWaitPane);
    }

    closeAllExceptModals(): void {
        let arr = this.children.slice();
        let cnt = arr.length;
        for (let i = 0; i < cnt; i++) {
            let g = arr[i];
            if ((g instanceof GWindow) && !g.modal)
                g.hide();
        }
    }

    closeAllWindows(): void {
        let arr = this.children.slice();
        let cnt = arr.length;
        for (let i = 0; i < cnt; i++) {
            let g = arr[i];
            if (g instanceof GWindow)
                g.hide();
        }
    }

    getTopWindow(): GWindow {
        let cnt = this.numChildren;
        for (let i = cnt - 1; i >= 0; i--) {
            let g = this.getChildAt(i);
            if (g instanceof GWindow) {
                return g;
            }
        }

        return null;
    }

    get modalLayer(): GWidget {
        return this._modalLayer;
    }

    get hasModalWindow(): boolean {
        return this._modalLayer.parent != null;
    }

    get modalWaiting(): boolean {
        return this._modalWaitPane && this._modalWaitPane.displayedInStage;
    }

    showPopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): void {
        this._popupMgr.showPopup(popup, target, dir);
    }

    togglePopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): boolean {
        return this._popupMgr.togglePopup(popup, target, dir);
    }

    hidePopup(popup?: GWidget): void {
        this._popupMgr.hidePopup(popup);
    }

    get hasAnyPopup(): boolean {
        return this._popupMgr.hasAnyPopup;
    }

    adjustModalLayer(): void {
        let cnt = this.numChildren;

        if (this._modalWaitPane && this._modalWaitPane.parent)
            this.setChildIndex(this._modalWaitPane, cnt - 1);

        for (let i = cnt - 1; i >= 0; i--) {
            let g = this.getChildAt(i);
            if ((g instanceof GWindow) && g.modal) {
                if (this._modalLayer.parent == null)
                    this.addChildAt(this._modalLayer, i);
                else
                    this.setChildIndexBefore(this._modalLayer, i);
                return;
            }
        }

        if (this._modalLayer.parent)
            this.removeChild(this._modalLayer);
    }
}
