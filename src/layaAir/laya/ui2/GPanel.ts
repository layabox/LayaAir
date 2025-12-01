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
 * @en GPanel is a container widget that supports clipping and scrolling, allowing for a flexible layout of its children.
 * @zh GPanel 是一个支持裁剪和滚动的容器小部件，允许其子元素灵活布局。
 * @blueprintInheritable
 */
export class GPanel extends GBox {
    private _clipping: boolean;
    private _scroller: IScroller;
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

    /**
     * @en The scroller component used for scrolling the panel's content.
     * @zh 用于滚动面板内容的滚动组件。
     */
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

    /**
     * @en The selection component used for managing the selection state of items in the panel.
     * @zh 用于管理面板中项目选择状态的选择组件。
     */
    get selection(): ISelection {
        return this._selection;
    }

    /**
     * @en The index of the currently selected item in the panel.
     * @zh 面板中当前选定项目的索引。
     */
    get selectedIndex(): number {
        return this._selection.index;
    }

    set selectedIndex(value: number) {
        this._selection.index = value;
    }

    /**
     * @en Whether the panel is clipping its content.
     * @zh 面板是否裁剪其内容。
     */
    get clipping(): boolean {
        return this._clipping;
    }

    set clipping(value: boolean) {
        if (this._clipping != value) {
            this._clipping = value;

            if (this._clipping) {
                this.scrollRect = new Rectangle(0, 0, this.width, this.height);
            }
            else
                this.scrollRect = null;
            if (this._scroller)
                this._scroller._processClipping();
        }
    }

    /**
     * @en The viewport width of the panel, which is the width of the visible area.
     * @zh 面板的视口宽度，即可见区域的宽度。
     */
    get viewWidth(): number {
        return this._layout.viewWidth;
    }

    set viewWidth(value: number) {
        this._layout.viewWidth = value;
    }

    /**
     * @en The viewport height of the panel, which is the height of the visible area.
     * @zh 面板的视口高度，即可见区域的高度。
     */
    get viewHeight(): number {
        return this._layout.viewHeight;
    }

    set viewHeight(value: number) {
        this._layout.viewHeight = value;
    }

    /**
     * @en The widget under the touch point.
     * @zh 在触摸点下的小部件。
     */
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
        if (this._scrollRect)
            this.scrollRect = this._scrollRect.setTo(0, 0, this.width, this.height);

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

    /** @ignore */
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
        [UIEvent.ClickItem]: (item: GButton, evt: Event) => void;
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