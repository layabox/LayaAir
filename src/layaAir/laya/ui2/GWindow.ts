
import { GWidget } from "./GWidget";
import { RelationType } from "./Const";
import { UIConfig2 } from "./UIConfig2";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { GRoot } from "./GRoot";

export class GWindow extends GWidget {
    public bringToFontOnClick: boolean;

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

    public set contentPane(val: GWidget) {
        if (this._contentPane != val) {
            if (this._contentPane)
                this.removeChild(this._contentPane);
            this._contentPane = val;
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

    public get contentPane(): GWidget {
        return this._contentPane;
    }

    public get frame(): GWidget {
        return this._frame;
    }

    public get closeButton(): GWidget {
        return this._closeButton;
    }

    public set closeButton(value: GWidget) {
        if (this._closeButton)
            this._closeButton.off(Event.CLICK, this, this.closeEventHandler);
        this._closeButton = value;
        if (this._closeButton)
            this._closeButton.on(Event.CLICK, this, this.closeEventHandler);
    }

    public get dragArea(): GWidget {
        return this._dragArea;
    }

    public set dragArea(value: GWidget) {
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

    public get contentArea(): GWidget {
        return this._contentArea;
    }

    public set contentArea(value: GWidget) {
        this._contentArea = value;
    }

    public show(): void {
        GRoot.inst.showWindow(this);
    }

    public hide(): void {
        if (this.isShowing)
            this.doHideAnimation();
    }

    public hideImmediately(): void {
        GRoot.inst.hideWindowImmediately(this);
    }

    public toggleStatus(): void {
        if (this.isTop)
            this.hide();
        else
            this.show();
    }

    public get isShowing(): boolean {
        return this.parent != null;
    }

    public get isTop(): boolean {
        return this.parent && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
    }

    public get modal(): boolean {
        return this._modal;
    }

    public set modal(val: boolean) {
        this._modal = val;
    }

    public bringToFront(): void {
        GRoot.inst.bringToFront(this);
    }

    public showModalWait(requestingCmd?: number) {
        if (requestingCmd != null)
            this._requestingCmd = requestingCmd;

        if (UIConfig2.windowModalWaiting) {
            if (!this._modalWaitPane)
                this._modalWaitPane = <GWidget>UIConfig2.windowModalWaiting.create();

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

    public closeModalWait(requestingCmd?: number): boolean {
        if (requestingCmd != null) {
            if (this._requestingCmd != requestingCmd)
                return false;
        }
        this._requestingCmd = 0;

        if (this.modalWaiting)
            this.removeChild(this._modalWaitPane);

        return true;
    }

    public get modalWaiting(): boolean {
        return this._modalWaitPane != null && this._modalWaitPane.parent != null;
    }

    protected async onInit(): Promise<void> {
    }

    protected onShown(): void {
    }

    protected onHide(): void {
    }

    protected doShowAnimation(): void {
        this.onShown();
    }

    protected doHideAnimation(): void {
        this.hideImmediately();
    }

    public destroy(): void {
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
                this.onInit().then(() => {
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

        //this.startDrag(evt.touchId);
    }
}

const s_pt = new Point();