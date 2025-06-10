import { GWidget } from "./GWidget";
import { ISelection } from "./selection/ISelection";
import { ILayout } from "./layout/ILayout";
import { Selection } from "./selection/Selection";
import { IScroller } from "./IScroller";
import { LayoutChangedReason } from "./Const";
import { GBox } from "./GBox";
import { Rectangle } from "../maths/Rectangle";
import { Sprite } from "../display/Sprite";
import { InputManager } from "../events/InputManager";
import { HideFlags } from "../Const";
import { Event } from "../events/Event";
import { UIEvent } from "./UIEvent";
import { GButton } from "./GButton";

/**
 * @blueprintInheritable
 */
export class GPanel extends GBox {
    private _clipping: boolean;
    private _scroller: IScroller;
    private _cachedScrollRect: Rectangle;
    private _maskContainer: Sprite;

    protected _selection: ISelection;

    constructor(layoutClass?: new (...args: any[]) => ILayout, selectionClass?: new (...args: any[]) => ISelection) {
        super(layoutClass);

        this._maskContainer = new Sprite();
        this._maskContainer.mouseThrough = true;
        this._maskContainer.hideFlags |= HideFlags.HideAndDontSave;
        this.addChild(this._maskContainer);

        let container = new PanelContainer();
        container.mouseThrough = true;
        container.hideFlags |= HideFlags.HideAndDontSave;
        this._maskContainer.addChild(container);

        this._setContainer(container);

        this._selection = new (selectionClass || Selection)(this);
        this.clipping = true;
    }

    get scroller(): IScroller {
        return this._scroller;
    }

    set scroller(value: IScroller) {
        if (this._scroller)
            this._scroller.owner = null;
        this._scroller = value;
        if (value)
            value.owner = this;
    }

    get selection(): ISelection {
        return this._selection;
    }

    get selectedIndex(): number {
        return this._selection.index;
    }

    set selectedIndex(value: number) {
        this._selection.index = value;
    }

    get clipping(): boolean {
        return this._clipping;
    }

    set clipping(value: boolean) {
        if (this._clipping != value) {
            this._clipping = value;

            if (this._clipping) {
                if (!this._cachedScrollRect)
                    this._cachedScrollRect = new Rectangle(0, 0, this.width, this.height);
                this.scrollRect = this._cachedScrollRect;
            }
            else
                this.scrollRect = null;
            if (this._scroller)
                this._scroller._processClipping();
        }
    }

    get viewWidth(): number {
        return this._layout.viewWidth;
    }

    set viewWidth(value: number) {
        this._layout.viewWidth = value;
    }

    get viewHeight(): number {
        return this._layout.viewHeight;
    }

    set viewHeight(value: number) {
        this._layout.viewHeight = value;
    }

    get touchItem(): GWidget {
        //find out which item is under finger
        //逐层往上知道查到点击了那个item
        let obj = InputManager.touchTarget;
        if (!obj)
            return null;
        let p = obj.parent;
        while (p != null) {
            if (p == this) {
                if (obj.parent == this)
                    return <GWidget>obj;
                else
                    return null;
            }

            obj = p;
            p = p.parent;
        }

        return null;
    }

    protected _sizeChanged(changeByLayout?: boolean): void {
        if (this._cachedScrollRect)
            this._cachedScrollRect.setTo(0, 0, this.width, this.height);

        //这里不调用super，因为layout.refresh需要在scroller后处理
        if (this._scroller)
            this._scroller._ownerSizeChanged();

        if (changeByLayout)
            this._layout.refresh();
    }

    /** @internal */
    _panelChildChanged(child: Sprite): void {
        this.setLayoutChangedFlag(LayoutChangedReason.Hierarchy);
    }

    destroy(): void {
        if (this._scroller)
            this._scroller.destroy();
        if (this._selection)
            this._selection.destroy();

        super.destroy();
    }

    /** @internal @blueprintEvent */
    GPanel_bpEvent: {
        [Event.CHANGED]: () => void;
        [UIEvent.ClickItem]: (item: GButton) => void;
        [UIEvent.Scroll]: () => void;
        [UIEvent.ScrollEnd]: () => void;
        [UIEvent.PullDownRelease]: () => void;
        [UIEvent.PullUpRelease]: () => void;
    };
}

class PanelContainer extends GWidget {
    protected _childChanged(child?: Sprite): void {
        super._childChanged(child);
        (this._parent._parent as GPanel)._panelChildChanged(child);
    }
}