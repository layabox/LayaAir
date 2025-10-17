import { ILaya } from "../../ILaya";
import { Event } from "../events/Event";
import { PopupDirection, RelationType } from "./Const";
import { PopupManager } from "./PopupManager";
import { UIConfig2 } from "./UIConfig";
import { GWidget } from "./GWidget";
import { GWindow } from "./GWindow";
import { Loader } from "../net/Loader";
import { HideFlags } from "../Const";

/**
 * @en GRoot is the root widget of the application, managing modal layers, popups, and windows.
 * @zh GRoot 是应用程序的根小部件，管理模态层、
 */
export class GRoot extends GWidget {
    private _modalLayer: GWidget;
    private _modalWaitPane: GWidget;
    private _popupMgr: PopupManager;

    /**
     * @en The layer index for the GRoot, used to ensure it is rendered above other 2D elements.
     * @zh GRoot 的层索引，用于确保它在其他 2D 元素之上渲染。
     */
    static LAYER = 1000;

    /**
     * @en The singleton instance of GRoot.
     * @zh GRoot 的单例实例。
     */
    static get inst(): GRoot {
        return GWidget._defaultRoot ?? (GWidget._defaultRoot = new GRoot());
    }

    /** @ignore @blueprintIgnore */
    constructor() {
        super();

        this.name = "GRoot";
        this.zOrder = GRoot.LAYER;
        this.mouseThrough = true;
        this.hideFlags |= HideFlags.HideAndDontSave;
        this.size(ILaya.stage.width, ILaya.stage.height);
        ILaya.stage.addChild(this);

        this._popupMgr = new PopupManager(this);

        this._modalLayer = new GWidget();
        this._modalLayer.mouseEnabled = true;
        this._modalLayer.hideFlags |= HideFlags.HideAndDontSave;
        this._modalLayer.size(this.width, this.height);
        this._modalLayer.graphics.drawRect(0, 0, 1, 1, UIConfig2.modalLayerColor, null, 0, true);
        this._modalLayer.addRelation(this, RelationType.Size);

        ILaya.stage.on(Event.RESIZE, () => {
            this.size(ILaya.stage.width, ILaya.stage.height);
        });
    }

    /**
     * @en The PopupManager instance used for managing popups in the GRoot.
     * @zh GRoot 中用于管理弹出窗口的 PopupManager 实例。
     */
    get popupMgr(): PopupManager {
        return this._popupMgr;
    }

    /**
     * @en Displays a window in the GRoot. Generally, you do not need to call this method directly, but rather use GWindow.show() method.
     * @param win The target window.
     * @zh 在 GRoot 中显示一个窗口。一般不需要直接调用这个方法，而是直接使用GWindow.show()方法。
     * @param win 目标窗口。
     */
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

    /**
     * @en Hides a window in the GRoot. Generally, you do not need to call this method directly, but rather use GWindow.hide() method.
     * @param win The window to hide.
     * @zh 在 GRoot 中隐藏一个窗口。一般不需要直接调用这个方法，而是直接使用GWindow.hide()方法。
     * @param win 要隐藏的窗口。 
     */
    hideWindow(win: GWindow): void {
        win.hide();
    }

    /**
     * @en Immediately hides a window in the GRoot without any animation, and will not call GWindow.onHide. Generally, you do not need to call this method directly.
     * @param win The window to hide.
     * @zh 立即隐藏 GRoot 中的窗口，不带任何动画，也不会调用GWindow.onHide。一般不需要直接调用这个方法。
     * @param win 要隐藏的窗口。 
     */
    hideWindowImmediately(win: GWindow): void {
        if (win.parent == this)
            this.removeChild(win);

        this.adjustModalLayer();
    }

    /**
     * @en Brings a window to the front in the GRoot, ensuring it is the topmost window.
     * @param win The window to bring to the front.
     * @zh 将一个窗口置于 GRoot 的最前面，确保它是最上层的窗口。
     * @param win 要置于最前面的窗口。
     */
    bringToFront(win: GWindow): void {
        let cnt = this.numChildren;
        let i: number;
        if (this._modalLayer.parent && !win.modal)
            i = this.getChildIndex(this._modalLayer) - 1;
        else
            i = cnt - 1;

        for (; i >= 0; i--) {
            let g: GWidget = this.getChildAt(i);
            if (g == win)
                return;
            if (g instanceof GWindow)
                break;
        }

        if (i >= 0)
            this.setChildIndex(win, i);
    }

    /**
     * @en Displays a modal waiting pane in the GRoot, which blocks user interaction with other elements.
     * @param msg Optional message to display in the modal waiting pane.
     * @zh 在 GRoot 中显示一个模态等待面板，阻止用户与其他元素的交互。
     * @param msg 可选的消息，在模态等待面板中显示。 
     */
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

    /**
     * @en Closes the modal waiting pane in the GRoot, allowing user interaction with other elements.
     * @zh 关闭 GRoot 中的模态等待面板，允许用户与其他元素交互。
     */
    closeModalWait(): void {
        if (this._modalWaitPane && this._modalWaitPane.parent)
            this.removeChild(this._modalWaitPane);
    }

    /**
     * @en Closes all windows in the GRoot except for modal windows.
     * @zh 关闭 GRoot 中的所有窗口，除了模态窗口。
     */
    closeAllExceptModals(): void {
        let arr = this.children.slice();
        let cnt = arr.length;
        for (let i = 0; i < cnt; i++) {
            let g = arr[i];
            if ((g instanceof GWindow) && !g.modal)
                g.hide();
        }
    }

    /**
     * @en Closes all windows in the GRoot, including modal windows.
     * @zh 关闭 GRoot 中的所有窗口，包括模态窗口。
     */
    closeAllWindows(): void {
        let arr = this.children.slice();
        let cnt = arr.length;
        for (let i = 0; i < cnt; i++) {
            let g = arr[i];
            if (g instanceof GWindow)
                g.hide();
        }
    }

    /**
     * @en Gets the topmost window in the GRoot.
     * @returns The topmost GWindow instance, or null if no windows are present.
     * @zh 获取 GRoot 中最上层的窗口。
     * @returns 最上层的 GWindow 实例，如果没有窗口则返回 null。 
     */
    getTopWindow(): GWindow | null {
        let cnt = this.numChildren;
        for (let i = cnt - 1; i >= 0; i--) {
            let g = this.getChildAt(i);
            if (g instanceof GWindow) {
                return g;
            }
        }

        return null;
    }

    /**
     * @en The modal layer used to block user interaction with other elements when a modal window is displayed.
     * @zh 用于在显示模态窗口时阻止用户与其他元素交互的模态层。
     */
    get modalLayer(): GWidget {
        return this._modalLayer;
    }

    /**
     * @en Indicates whether there is a modal window currently displayed in the GRoot.
     * @zh 指示 GRoot 中是否有模态窗口当前显示。
     */
    get hasModalWindow(): boolean {
        return this._modalLayer.parent != null;
    }

    /**
     * @en Indicates whether a modal waiting pane is currently displayed in the GRoot.
     * @zh 指示 GRoot 中是否有模态等待面板当前显示。
     */
    get modalWaiting(): boolean {
        return this._modalWaitPane && this._modalWaitPane.displayedInStage;
    }

    /**
     * @en Displays a popup in the GRoot, which can be positioned relative to a target widget or in a specific direction.
     * @param popup The popup widget to display.
     * @param target Optional target widget to position the popup relative to. If not provided, the popup will be positioned at the mouse position. 
     * @param dir Optional direction in which to display the popup. If not provided, the default direction will be used. 
     * @zh 在 GRoot 中显示一个弹出窗口，可以相对于目标小部件定位或在特定方向上显示。
     * @param popup 要显示的弹出窗口小部件。
     * @param target 可选的目标小部件，用于相对于其定位弹出窗口。如果未提供，则弹出窗口将定位在鼠标位置。
     * @param dir 可选的方向，用于显示弹出窗口。如果未提供，则使用默认方向。
     */
    showPopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): void {
        this._popupMgr.showPopup(popup, target, dir);
    }

    /**
     * @en Toggles the visibility of a popup in the GRoot. If the popup is already displayed, it will be hidden; otherwise, it will be shown.
     * @param popup The popup widget to toggle.
     * @param target Optional target widget to position the popup relative to. If not provided, the popup will be positioned at the mouse position. 
     * @param dir Optional direction in which to display the popup. If not provided, the default direction will be used. 
     * @returns Returns true if the popup was shown, false if it was hidden.
     * @zh 弹出或收起一个弹出窗口小部件。如果弹出窗口已经显示，则将其隐藏；否则，将其显示。
     * @param popup 要切换的弹出窗口小部件。
     * @param target 可选的目标小部件，用于相对于其定位弹出窗口。如果未提供，则弹出窗口将定位在鼠标位置。
     * @param dir 可选的方向，用于显示弹出窗口。如果未提供，则使用默认方向。
     * @return 如果弹出窗口被显示则返回 true，如果被隐藏则返回 false。
     */
    togglePopup(popup: GWidget, target?: GWidget, dir?: PopupDirection): boolean {
        return this._popupMgr.togglePopup(popup, target, dir);
    }

    /**
     * @en Hides a popup in the GRoot. If no popup is specified, it will hide the topmost popup.
     * @param popup Optional popup widget to hide. If not provided, the topmost popup will be hidden.
     * @zh 在 GRoot 中隐藏一个弹出窗口。如果未指定弹出窗口，则将隐藏最上层的弹出窗口。
     * @param popup 可选的弹出窗口小部件。如果未提供，则隐藏最上层的弹出窗口。 
     */
    hidePopup(popup?: GWidget): void {
        this._popupMgr.hidePopup(popup);
    }

    /**
     * @en Whether there are any popups currently displayed in the GRoot.
     * @zh GRoot 中是否有任何弹出窗口当前显示。
     */
    get hasAnyPopup(): boolean {
        return this._popupMgr.hasAnyPopup;
    }

    /** @internal */
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
