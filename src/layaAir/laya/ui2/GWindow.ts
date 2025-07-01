
import { GWidget } from "./GWidget";
import { RelationType } from "./Const";
import { UIConfig2 } from "./UIConfig";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Loader } from "../net/Loader";

/**
 * @en GWindow is a widget that provides a window interface for displaying content.
 * @zh GWindow 是一个提供窗口界面的小部件，用于显示内容。
 * @blueprintInheritable
 */
export class GWindow extends GWidget {
    /**
     * @en Whether the window should be brought to the front when clicked.
     * @zh 是否在点击时将窗口带到前面。
     */
    bringToFontOnClick: boolean;

    private _contentPane: GWidget;
    private _modalWaitPane: GWidget;
    private _closeButton: GWidget;
    private _dragArea: GWidget;
    private _contentArea: GWidget;
    private _frame: GWidget;
    private _modal: boolean;

    private _inited: boolean;
    private _loading: boolean;

    private _requestingCmd: number = 0;

    constructor() {
        super();

        this.bringToFontOnClick = UIConfig2.bringWindowToFrontOnClick;

        this.on(Event.DISPLAY, this, this._onShown);
        this.on(Event.UNDISPLAY, this, this._onHidden);
        this.on(Event.MOUSE_DOWN, this, this._winTouchBegin);
    }

    /**
     * @en The content pane of the window, which contains the main content to be displayed.
     * @zh 窗口的内容面板，包含要显示的主要内容。
     */
    get contentPane(): GWidget {
        return this._contentPane;
    }

    set contentPane(value: GWidget) {
        if (this._contentPane != value) {
            if (this._contentPane)
                this.removeChild(this._contentPane);
            this._contentPane = value;
            if (this._contentPane) {
                this.addChild(this._contentPane);
                this.size(this._contentPane.width, this._contentPane.height);
                this._contentPane.addRelation(this, RelationType.Size);
                this._frame = this._contentPane.getChild("frame");
                if (this._frame) {
                    this.closeButton = this._frame.getChild("closeButton");
                    this.dragArea = this._frame.getChild("dragArea");
                    this.contentArea = this._frame.getChild("contentArea");
                }
            }
        }
    }

    /**
     * @en The frame of the window.
     * @zh 窗口的框架。
     */
    get frame(): GWidget {
        return this._frame;
    }

    /**
     * @en The button used to close the window.
     * @zh 用于关闭窗口的按钮。
     */
    get closeButton(): GWidget {
        return this._closeButton;
    }

    set closeButton(value: GWidget) {
        if (this._closeButton)
            this._closeButton.off(Event.CLICK, this, this.closeEventHandler);
        this._closeButton = value;
        if (this._closeButton)
            this._closeButton.on(Event.CLICK, this, this.closeEventHandler);
    }

    /**
     * @en The area of the window that can be dragged to move the window.
     * @zh 窗口中可以拖动以移动窗口的区域。
     */
    get dragArea(): GWidget {
        return this._dragArea;
    }

    set dragArea(value: GWidget) {
        if (this._dragArea != value) {
            if (this._dragArea) {
                this._dragArea.draggable = false;
                this._dragArea.off(Event.DRAG_START, this, this._dragStart);
            }

            this._dragArea = value;
            if (this._dragArea) {
                this._dragArea.draggable = true;
                this._dragArea.on(Event.DRAG_START, this, this._dragStart);
            }
        }
    }

    /**
     * @en The area of the window that contains the main content.
     * @zh 窗口中包含主要内容的区域。
     */
    get contentArea(): GWidget {
        return this._contentArea;
    }

    set contentArea(value: GWidget) {
        this._contentArea = value;
    }

    /**
     * @en Shows the window, bringing it to the front if it is already displayed.
     * @zh 显示窗口，如果窗口已经显示，则将其带到前面
     */
    show(): void {
        GWidget._defaultRoot.showWindow(this);
    }

    /**
     * @en Hides the window, removing it from the display.
     * @zh 隐藏窗口，将其从显示中移除。
     */
    hide(): void {
        if (this.isShowing)
            this.doHideAnimation();
    }

    /**
     * @en Hides the window immediately without any animation.
     * @zh 立即隐藏窗口，不进行任何动画。
     */
    hideImmediately(): void {
        GWidget._defaultRoot.hideWindowImmediately(this);
    }

    /**
     * @en Toggles the visibility of the window. If it is currently displayed, it will be hidden; if it is hidden, it will be shown.
     * @zh 切换窗口的可见性。如果当前显示，则隐藏；如果隐藏，则显示。
     */
    toggleStatus(): void {
        if (this.isTop)
            this.hide();
        else
            this.show();
    }

    /**
     * @en Checks if the window is currently displayed.
     * @zh 检查窗口当前是否显示。
     */
    get isShowing(): boolean {
        return this.parent != null;
    }

    /**
     * @en Checks if the window is the topmost window in the display hierarchy.
     * @zh 检查窗口是否是显示层次结构中的最上层窗口
     */
    get isTop(): boolean {
        return this.parent && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
    }

    /**
     * @en Indicates whether the window is modal, meaning it blocks interaction with other windows until it is closed.
     * @zh 指示窗口是否为模态窗口，即在关闭之前阻止与其他窗口的交互。
     */
    get modal(): boolean {
        return this._modal;
    }

    set modal(val: boolean) {
        this._modal = val;
    }

    /**
     * @en Brings the window to the front of the display list, making it the topmost window.
     * @zh 将窗口带到显示列表的前面，使其成为最上层窗口。
     */
    bringToFront(): void {
        GWidget._defaultRoot.bringToFront(this);
    }

    /**
     * @en Shows a modal waiting pane, which blocks interaction with the window until it is closed.
     * @param requestingCmd Optional command ID that can be used to close the modal wait pane.
     * @zh 显示一个模态等待面板，在关闭之前阻止与窗口的交互。
     * @param requestingCmd 可选的命令ID，可用于关闭模态等待面板。 
     */
    showModalWait(requestingCmd?: number) {
        if (requestingCmd != null)
            this._requestingCmd = requestingCmd;

        if (UIConfig2.windowModalWaiting) {
            if (!this._modalWaitPane)
                this._modalWaitPane = Loader.createNodes(UIConfig2.windowModalWaiting);
            this._modalWaitPane.mouseEnabled = true;
            this.layoutModalWaitPane();

            this.addChild(this._modalWaitPane);
        }
    }

    protected layoutModalWaitPane(): void {
        if (this._contentArea) {
            let pt = this._frame.localToGlobal(s_pt.setTo(0, 0));
            pt = this.globalToLocal(pt);
            this._modalWaitPane.pos(pt.x + this._contentArea.x, pt.y + this._contentArea.y);
            this._modalWaitPane.size(this._contentArea.width, this._contentArea.height);
        }
        else
            this._modalWaitPane.size(this.width, this.height);
    }

    /**
     * @en Closes the modal wait pane if it is currently displayed.
     * @param requestingCmd Optional command ID that must match the one used to show the modal wait pane.
     * @zh 如果模态等待面板当前显示，则关闭它。
     * @param requestingCmd 可选的命令ID，必须与用于显示模态等待面板的命令ID匹配。
     */
    closeModalWait(requestingCmd?: number): boolean {
        if (requestingCmd != null) {
            if (this._requestingCmd != requestingCmd)
                return false;
        }
        this._requestingCmd = 0;

        if (this.modalWaiting)
            this.removeChild(this._modalWaitPane);

        return true;
    }

    /**
     * @en Checks if the modal wait pane is currently displayed.
     * @zh 检查模态等待面板当前是否显示。
     */
    get modalWaiting(): boolean {
        return this._modalWaitPane != null && this._modalWaitPane.parent != null;
    }

    /**
     * @en Initializes the window. This method is called when the window is first shown.
     * It can be overridden to perform custom initialization logic.
     * @returns A promise that resolves when the initialization is complete.
     * @zh 初始化窗口。此方法在窗口首次显示时调用。
     * 可以重写此方法以执行自定义初始化逻辑。
     * @returns 一个在初始化完成时解析的 Promise。
     * @blueprintEvent
     */
    protected onInit(): void | Promise<void> {
    }

    /**
     * @en Called when the window is shown. This method can be overridden to perform actions when the window becomes visible.
     * @zh 当窗口显示时调用。可以重写此方法以在窗口变为可见时执行操作。
     * @blueprintEvent
     */
    protected onShown(): void {
    }

    /**
     * @en Called when the window is hidden. This method can be overridden to perform actions when the window is no longer visible.
     * @zh 当窗口隐藏时调用。可以重写此方法以在窗口不再可见时执行操作。
     * @blueprintEvent
     */
    protected onHide(): void {
    }

    /**
     * @en Performs the show animation for the window. This method can be overridden to implement custom show animations.
     * @zh 执行窗口的显示动画。可以重写此方法以实现自定义显示动画。
     */
    protected doShowAnimation(): void {
        this.onShown();
    }

    /**
     * @en Performs the hide animation for the window. This method can be overridden to implement custom hide animations.
     * @zh 执行窗口的隐藏动画。可以重写此方法以实现自定义隐藏动画。
     */
    protected doHideAnimation(): void {
        this.hideImmediately();
    }

    /** @ignore */
    destroy(): void {
        if (this.parent)
            this.hideImmediately();

        super.destroy();
    }

    protected closeEventHandler(): void {
        this.hide();
    }

    private _onShown(): void {
        if (!this._inited) {
            if (!this._loading) {
                this._loading = true;
                Promise.resolve(this.onInit()).then(() => {
                    this._loading = false;
                    this._inited = true;

                    if (this.isShowing)
                        this.doShowAnimation();
                });
            }
        }
        else
            this.doShowAnimation();
    }

    private _onHidden(): void {
        this.closeModalWait();
        this.onHide();
    }

    private _winTouchBegin(): void {
        if (this.isShowing && this.bringToFontOnClick)
            this.bringToFront();
    }

    private _dragStart(evt: Event): void {
        this._dragArea.stopDrag();

        this.startDrag();
    }
}

const s_pt = new Point();