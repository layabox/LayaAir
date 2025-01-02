
import { ILaya } from "../../ILaya";
import { HideFlags, NodeFlags } from "../Const";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { InputManager } from "../events/InputManager";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { MathUtil } from "../maths/MathUtil";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Prefab } from "../resource/HierarchyResource";
import { ITweener } from "../tween/ITween";
import { Tween } from "../tween/Tween";
import { Browser } from "../utils/Browser";
import { SpriteUtils } from "../utils/SpriteUtils";
import { LayoutType, PageMode, ScrollBarDisplay, ScrollBounceBackEffect, ScrollDirection, ScrollTouchEffect } from "./Const";
import { DragSupport } from "./DragSupport";
import { IScroller } from "./IScroller";
import type { GPanel } from "./GPanel";
import type { GScrollBar } from "./GScrollBar";
import { UIConfig2 } from "./UIConfig";
import { GWidget } from "./GWidget";
import { ILayout } from "./layout/ILayout";
import { ListLayout } from "./layout/ListLayout";
import { UIEventType } from "./UIEvent";

type AxisType = "x" | "y";

var s_Point = new Point();
var s_rect = new Rectangle();
var s_rect2 = new Rectangle();
var s_endPos = new Point();
var s_oldChange = new Point();
var s_gestureFlag = 0;

const TWEEN_TIME_GO = 0.5; //调用SetPos(ani)时使用的缓动时间
const TWEEN_TIME_DEFAULT = 0.3; //惯性滚动的最小缓动时间
const PULL_RATIO = 0.5; //下拉过顶或者上拉过底时允许超过的距离占显示区域的比例

export class Scroller implements IScroller {
    public static draggingInst: Scroller;

    private _owner: GPanel;
    private _layout: ILayout;
    private _container: Sprite;
    private _maskContainer: Sprite;

    private _dir: ScrollDirection = 0;
    private _step: number = 0;
    private _decelerationRate: number = 0;
    private _barMargin: Array<number>;
    private _barDisplay: ScrollBarDisplay = 0;
    private _barDisplay2: ScrollBarDisplay = 0;
    private _barOnLeft: boolean;
    private _barFloating: boolean;
    private _touchEffect: boolean;
    private _touchEffect2: ScrollTouchEffect = 0;
    private _bouncebackEffect: boolean;
    private _bouncebackEffect2: ScrollBounceBackEffect = 0;
    private _touchEffectButton: number = 0;
    private _snapToItem: boolean;
    private _mouseWheelDisabled: boolean;
    private _pageMode: boolean;
    private _inertiaDisabled: boolean;
    private _paddingMaskDisabled: boolean;
    private _hScrollBarRes: Prefab;
    private _vScrollBarRes: Prefab;
    private _footerRes: Prefab;
    private _headerRes: Prefab;

    private _vScrollNone: boolean;
    private _hScrollNone: boolean;
    private _needRefresh: boolean;
    private _refreshBarAxis: AxisType;
    private _xPos: number = 0;
    private _yPos: number = 0;

    private _viewSize: Point;
    private _contentSize: Point;
    private _overlapSize: Point;
    private _pageSize: Point;
    private _containerPos: Point;
    private _beginTouchPos: Point;
    private _lastTouchPos: Point;
    private _lastTouchGlobalPos: Point;
    private _velocity: Point;
    private _velocityScale: number = 0;
    private _lastMoveTime: number = 0;
    private _isHoldAreaDone: boolean;
    private _aniFlag: number = 0;
    private _loop: number = 0;
    private _headerLockedSize: number = 0;
    private _footerLockedSize: number = 0;
    private _refreshEventDispatching: boolean;
    private _dragged: boolean;
    private _hover: boolean;
    private _cachedScrollRect: Rectangle;

    private _tweening: number = 0;
    private _tweenTime: Point;
    private _tweenDuration: Point;
    private _tweenStart: Point;
    private _tweenChange: Point;

    private _hScrollBar: GScrollBar;
    private _vScrollBar: GScrollBar;
    private _header: GWidget;
    private _footer: GWidget;

    constructor() {
        this._barMargin = [0, 0, 0, 0];
        this._viewSize = new Point();
        this._contentSize = new Point();
        this._pageSize = new Point(1, 1);
        this._overlapSize = new Point();
        this._tweenTime = new Point();
        this._tweenStart = new Point();
        this._tweenDuration = new Point();
        this._tweenChange = new Point();
        this._velocity = new Point();
        this._containerPos = new Point();
        this._beginTouchPos = new Point();
        this._lastTouchPos = new Point();
        this._lastTouchGlobalPos = new Point();
        this._cachedScrollRect = new Rectangle();
        this._step = UIConfig2.defaultScrollStep;
        this._decelerationRate = UIConfig2.defaultScrollDecelerationRate;
        this._barDisplay = UIConfig2.defaultScrollBarDisplay;
        this._touchEffect = UIConfig2.defaultScrollTouchEffect;
        this._bouncebackEffect = UIConfig2.defaultScrollTouchEffect;
    }

    public get owner() {
        return this._owner;
    }

    public set owner(value: GPanel) {
        if (this._owner == value)
            return;

        if (this._owner) {
            this._owner.offAllCaller(this);

            if (this._tweening != 0)
                ILaya.timer.clear(this, this.tweenUpdate);

            if (this._hScrollBar) {
                this._hScrollBar.destroy();
                this._hScrollBar = null;
            }
            if (this._vScrollBar) {
                this._vScrollBar.destroy();
                this._vScrollBar = null;
            }
            if (this._header) {
                this._header.destroy();
                this._header = null;
            }
            if (this._footer) {
                this._footer.destroy();
                this._footer = null;
            }

            this._container.pos(0, 0);

            this._owner.setLayoutChangedFlag();
        }

        this._owner = value;

        if (value) {
            this._layout = value.layout;
            this._maskContainer = value._maskContainer;
            this._container = value._container;
            this._container.pos(0, 0);

            if (!SerializeUtil.isDeserializing) {
                value.clipping = true;
                this._setDefaultDirection();
            }

            this.createHzScrollBar();
            this.createVtScrollBar();

            value.on(Event.MOUSE_DOWN, this, this._touchBegin);
            value.on(Event.MOUSE_DRAG, this, this._touchMove);
            value.on(Event.MOUSE_UP, this, this._touchEnd);
            value.on(Event.MOUSE_WHEEL, this, this._mouseWheel);
            value.on(Event.ROLL_OVER, this, this._rollOver);
            value.on(Event.ROLL_OUT, this, this._rollOut);

            value.setLayoutChangedFlag();
            this._processClipping();
            this._ownerSizeChanged();
        }
    }

    destroy() {
        this.owner = null;
    }

    public get hScrollBar(): GScrollBar {
        return this._hScrollBar;
    }

    public get vScrollBar(): GScrollBar {
        return this._vScrollBar;
    }

    public get header(): GWidget {
        return this._header;
    }

    public get footer(): GWidget {
        return this._footer;
    }

    public get hScrollBarRes(): Prefab {
        return this._hScrollBarRes;
    }

    public set hScrollBarRes(value: Prefab) {
        this._hScrollBarRes = value;
        if (this._hScrollBar)
            this._hScrollBar._setBit(NodeFlags.LOCK_BY_EDITOR, true); //借用一下这个标志
        this.createHzScrollBar();
    }

    public get vScrollBarRes(): Prefab {
        return this._vScrollBarRes;
    }

    public set vScrollBarRes(value: Prefab) {
        this._vScrollBarRes = value;
        if (this._vScrollBar)
            this._vScrollBar._setBit(NodeFlags.LOCK_BY_EDITOR, true); //借用一下这个标志
        this.createVtScrollBar();
    }

    public get headerRes(): Prefab {
        return this._headerRes;
    }

    public set headerRes(value: Prefab) {
        this._headerRes = value;
        this.createHeader();
    }

    public get footerRes(): Prefab {
        return this._footerRes;
    }

    public set footerRes(value: Prefab) {
        this._footerRes = value;
        this.createFooter();
    }

    public get direction(): ScrollDirection {
        return this._dir;
    }

    public set direction(value: ScrollDirection) {
        if (this._dir != value) {
            this._dir = value;

            if (this._refreshBarAxis != null)
                this._refreshBarAxis = (this._dir == ScrollDirection.Both || this._dir == ScrollDirection.Vertical) ? "y" : "x";
            this.createHzScrollBar();
            this.createVtScrollBar();
        }
    }

    public get barDisplay(): ScrollBarDisplay {
        return this._barDisplay2;
    }

    public set barDisplay(value: ScrollBarDisplay) {
        if (this._barDisplay2 != value) {
            this._barDisplay2 = value;
            this._barDisplay = value == ScrollBarDisplay.Default ? UIConfig2.defaultScrollBarDisplay : value;
            this.createHzScrollBar();
            this.createVtScrollBar();
        }
    }

    public get barOnLeft(): boolean {
        return this._barOnLeft;
    }

    public set barOnLeft(value: boolean) {
        if (this._barOnLeft != value) {
            this._barOnLeft = value;
            this.onSizeChanged();
        }
    }

    public get barFloating(): boolean {
        return this._barFloating;
    }

    public set barFloating(value: boolean) {
        if (this._barFloating != value) {
            this._barFloating = value;
            this.onSizeChanged();
        }
    }

    public get barMargin(): Array<number> {
        return this._barMargin;
    }

    public set barMargin(value: Array<number>) {
        if (value == null || !Array.isArray(value)) value = [0, 0, 0, 0];
        this._barMargin = value;
        this.onSizeChanged();
    }

    public get bouncebackEffect(): ScrollBounceBackEffect {
        return this._bouncebackEffect2;
    }

    public set bouncebackEffect(value: ScrollBounceBackEffect) {
        this._bouncebackEffect2 = value;
        if (value == ScrollBounceBackEffect.Default)
            this._bouncebackEffect = UIConfig2.defaultScrollBounceEffect;
        else
            this._bouncebackEffect = value == ScrollBounceBackEffect.On;
    }

    public get touchEffect(): ScrollTouchEffect {
        return this._touchEffect2;
    }

    public set touchEffect(value: ScrollTouchEffect) {
        this._touchEffect2 = value;
        if (value == ScrollTouchEffect.Default)
            this._touchEffect = UIConfig2.defaultScrollTouchEffect;
        else
            this._touchEffect = value == ScrollTouchEffect.On;
    }

    public get touchEffectButton(): number {
        return this._touchEffectButton;
    }

    public set touchEffectButton(value: number) {
        this._touchEffectButton = value;
    }

    public get pageMode(): boolean {
        return this._pageMode;
    }

    public set pageMode(value: boolean) {
        this._pageMode = value;
    }

    public set step(value: number) {
        this._step = value;
    }

    public get step(): number {
        return this._step;
    }

    public get snapToItem(): boolean {
        return this._snapToItem;
    }

    public set snapToItem(value: boolean) {
        this._snapToItem = value;
    }

    public get inertiaDisabled(): boolean {
        return this._inertiaDisabled;
    }

    public set inertiaDisabled(value: boolean) {
        this._inertiaDisabled = value;
    }

    public get paddingMaskDisabled(): boolean {
        return this._paddingMaskDisabled;
    }

    public set paddingMaskDisabled(value: boolean) {
        if (this._paddingMaskDisabled != value) {
            this._paddingMaskDisabled = value;
            this._processClipping();
        }
    }

    public get mouseWheelDisabled(): boolean {
        return this._mouseWheelDisabled;
    }

    public set mouseWheelDisabled(value: boolean) {
        this._mouseWheelDisabled = value;
    }

    public get decelerationRate(): number {
        return this._decelerationRate;
    }

    public set decelerationRate(value: number) {
        this._decelerationRate = value;
    }

    public get isDragged(): boolean {
        return this._dragged;
    }

    public get percX(): number {
        return this._overlapSize.x == 0 ? 0 : this._xPos / this._overlapSize.x;
    }

    public set percX(value: number) {
        this.setPercX(value, false);
    }

    public setPercX(value: number, ani?: boolean): void {
        this._layout.refresh();
        this.setPosX(this._overlapSize.x * MathUtil.clamp01(value), ani);
    }

    public get percY(): number {
        return this._overlapSize.y == 0 ? 0 : this._yPos / this._overlapSize.y;
    }

    public set percY(value: number) {
        this.setPercY(value, false);
    }

    public setPercY(value: number, ani?: boolean): void {
        this._layout.refresh();
        this.setPosY(this._overlapSize.y * MathUtil.clamp01(value), ani);
    }

    public get posX(): number {
        return this._xPos;
    }

    public set posX(value: number) {
        this.setPosX(value, false);
    }

    public setPosX(value: number, ani?: boolean): void {
        this._layout.refresh();

        if (this._loop == 1)
            value = this.loopCheckingNewPos(value, "x");

        value = MathUtil.clamp(value, 0, this._overlapSize.x);
        if (value != this._xPos) {
            this._xPos = value;
            this.posChanged(ani);
        }
    }

    public get posY(): number {
        return this._yPos;
    }

    public set posY(value: number) {
        this.setPosY(value, false);
    }

    public setPosY(value: number, ani?: boolean): void {
        this._layout.refresh();

        if (this._loop == 1)
            value = this.loopCheckingNewPos(value, "y");

        value = MathUtil.clamp(value, 0, this._overlapSize.y);
        if (value != this._yPos) {
            this._yPos = value;
            this.posChanged(ani);
        }
    }

    public get contentWidth(): number {
        return this._contentSize.x;
    }

    public get contentHeight(): number {
        return this._contentSize.y;
    }

    public get viewWidth(): number {
        return this._viewSize.x;
    }

    public get viewHeight(): number {
        return this._viewSize.y;
    }

    public setViewSize(width: number, height: number) {
        width = width + this._layout.padding[3] + this._layout.padding[1];
        if (this._vScrollBar && !this._barFloating)
            width += this._vScrollBar.width;

        height = height + this._layout.padding[0] + this._layout.padding[2];
        if (this._hScrollBar && !this._barFloating)
            height += this._hScrollBar.height;
        this._owner.size(width, height);
    }

    public get pageX(): number {
        if (!this._pageMode)
            return 0;

        let page: number = Math.floor(this._xPos / this._pageSize.x);
        if (this._xPos - page * this._pageSize.x > this._pageSize.x * 0.5)
            page++;

        return page;
    }

    public set pageX(value: number) {
        this.setPageX(value, false);
    }

    public get pageY(): number {
        if (!this._pageMode)
            return 0;

        let page: number = Math.floor(this._yPos / this._pageSize.y);
        if (this._yPos - page * this._pageSize.y > this._pageSize.y * 0.5)
            page++;

        return page;
    }

    public set pageY(value: number) {
        this.setPageY(value, false);
    }

    public setPageX(value: number, ani?: boolean): void {
        if (!this._pageMode)
            return;

        this._layout.refresh();

        if (this._overlapSize.x > 0)
            this.setPosX(value * this._pageSize.x, ani);
    }

    public setPageY(value: number, ani?: boolean): void {
        if (!this._pageMode)
            return;

        this._layout.refresh();

        if (this._overlapSize.y > 0)
            this.setPosY(value * this._pageSize.y, ani);
    }

    public get isBottomMost(): boolean {
        return this._yPos == this._overlapSize.y || this._overlapSize.y == 0;
    }

    public get isRightMost(): boolean {
        return this._xPos == this._overlapSize.x || this._overlapSize.x == 0;
    }

    public get scrollingPosX(): number {
        return MathUtil.clamp(-this._container.x, 0, this._overlapSize.x);
    }

    public get scrollingPosY(): number {
        return MathUtil.clamp(-this._container.y, 0, this._overlapSize.y);
    }

    public scrollTop(ani?: boolean): void {
        this.setPercY(0, ani);
    }

    public scrollBottom(ani?: boolean): void {
        this.setPercY(1, ani);
    }

    public scrollUp(ratio?: number, ani?: boolean): void {
        ratio = ratio || 1;
        if (this._pageMode)
            this.setPosY(this._yPos - this._pageSize.y * ratio, ani);
        else
            this.setPosY(this._yPos - this._step * ratio, ani);;
    }

    public scrollDown(ratio?: number, ani?: boolean): void {
        ratio = ratio || 1;
        if (this._pageMode)
            this.setPosY(this._yPos + this._pageSize.y * ratio, ani);
        else
            this.setPosY(this._yPos + this._step * ratio, ani);
    }

    public scrollLeft(ratio?: number, ani?: boolean): void {
        ratio = ratio || 1;
        if (this._pageMode)
            this.setPosX(this._xPos - this._pageSize.x * ratio, ani);
        else
            this.setPosX(this._xPos - this._step * ratio, ani);
    }

    public scrollRight(ratio?: number, ani?: boolean): void {
        ratio = ratio || 1;
        if (this._pageMode)
            this.setPosX(this._xPos + this._pageSize.x * ratio, ani);
        else
            this.setPosX(this._xPos + this._step * ratio, ani);
    }

    private getRect(target: GWidget, rect: Rectangle) {
        if (target.parent != this._owner)
            SpriteUtils.transformRect(target.parent, rect.setTo(target.x, target.y, target.width, target.height), this._owner);
        else
            rect.setTo(target.x, target.y, target.width, target.height);
        return rect;
    }

    public scrollTo(target: GWidget, ani?: boolean, setFirst?: boolean): void;
    public scrollTo(target: GWidget, ani?: boolean, secondTarget?: GWidget): void;
    public scrollTo(target: Rectangle, ani?: boolean, setFirst?: boolean): void;
    public scrollTo(target: number, ani?: boolean, setFirst?: boolean): void;
    public scrollTo(target: GWidget | Rectangle | number, ani?: boolean, setFirst?: boolean | GWidget): void {
        this._layout.refresh();
        if (this._needRefresh)
            this.refresh();

        let rect: Rectangle;
        if (typeof (target) === "number") {
            if ((this._layout instanceof ListLayout) && this._layout._virtual)
                target = this._layout.getRectByItemIndex(target);
            else
                target = <GWidget>this._owner.getChildAt(target);
        }

        if (target instanceof Rectangle)
            rect = target;
        else if (target.parent == null)
            return;
        else
            rect = this.getRect(target, s_rect);

        let setFirstX: boolean, setFirstY: boolean;

        if (setFirst instanceof GWidget) {
            if (setFirst != target && setFirst.parent != null) {
                let rect2 = this.getRect(setFirst, s_rect2);
                if (this._overlapSize.x > 0 && rect.right - rect2.x > this._viewSize.x) {
                    rect.x = rect2.x;
                    rect.width = rect2.width;
                    setFirstX = true;
                }
                if (this._overlapSize.y > 0 && rect.bottom - rect2.y > this._viewSize.y) {
                    rect.y = rect2.y;
                    rect.height = rect2.height;
                    setFirstY = true;
                }
            }
            else
                setFirstX = setFirstY = false;
        }
        else
            setFirstX = setFirstY = !!setFirst;

        if (this._overlapSize.y > 0) {
            let bottom: number = this._yPos + this._viewSize.y;
            if (setFirstX || rect.y <= this._yPos) {
                if (!setFirstX && rect.y + rect.height >= bottom) //if an item size is large than viewSize, dont scroll
                    return;
                if (this._pageMode)
                    this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);
                else
                    this.setPosY(rect.y, ani);
            }
            else if (rect.y + rect.height > bottom) {
                if (this._pageMode)
                    this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);
                else if (rect.height <= this._viewSize.y / 2)
                    this.setPosY(rect.y + rect.height * 2 - this._viewSize.y, ani);
                else
                    this.setPosY(rect.y + Math.min(rect.height - this._viewSize.y, 0), ani);
            }
        }
        if (this._overlapSize.x > 0) {
            let right: number = this._xPos + this._viewSize.x;
            if (setFirstY || rect.x <= this._xPos) {
                if (!setFirstY && rect.x + rect.width >= right) //if an item size is large than viewSize, dont scroll
                    return;

                if (this._pageMode)
                    this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);
                else
                    this.setPosX(rect.x, ani);
            }
            else if (rect.x + rect.width > right) {
                if (this._pageMode)
                    this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);
                else if (rect.width <= this._viewSize.x / 2)
                    this.setPosX(rect.x + rect.width * 2 - this._viewSize.x, ani);
                else
                    this.setPosX(rect.x + Math.min(rect.width - this._viewSize.x, 0), ani);
            }
        }

        if (!ani && this._needRefresh)
            this.refresh();
    }

    public isChildInView(obj: GWidget): boolean {
        if (this._overlapSize.y > 0) {
            let dist = obj.y + this._container.y;
            if (dist < -obj.height || dist > this._viewSize.y)
                return false;
        }

        if (this._overlapSize.x > 0) {
            let dist = obj.x + this._container.x;
            if (dist < -obj.width || dist > this._viewSize.x)
                return false;
        }

        return true;
    }

    public getFirstChildInView(): number {
        let i = 0;
        for (let child of this._owner.children) {
            if (this.isChildInView(<GWidget>child))
                return i;
            i++;
        }
        return -1;
    }

    public cancelDragging(): void {
        if (Scroller.draggingInst == this)
            Scroller.draggingInst = null;

        s_gestureFlag = 0;
        this._dragged = false;
    }

    public _setDefaultDirection() {
        let layout = this._layout;
        if (layout.pageMode == PageMode.Horizontal || layout.type == LayoutType.SingleColumn || layout.type == LayoutType.FlowX)
            this.direction = ScrollDirection.Vertical;
        else if (layout.pageMode == PageMode.Vertical || layout.type == LayoutType.SingleRow || layout.type == LayoutType.FlowY)
            this.direction = ScrollDirection.Horizontal;
    }

    private createVtScrollBar() {
        if (!this._owner)
            return;

        if (this._barDisplay != ScrollBarDisplay.Hidden && (this._dir == ScrollDirection.Both || this._dir == ScrollDirection.Vertical)) {
            if (this._vScrollBar && !this._vScrollBar._getBit(NodeFlags.LOCK_BY_EDITOR))
                return;

            let res = this._vScrollBarRes ? this._vScrollBarRes : UIConfig2.verticalScrollBar;
            if (res) {
                this._vScrollBar = <GScrollBar>res.create();
                if (!this._vScrollBar) {
                    console.warn("failed to create a vertical scrollbar");
                    return;
                }
                this._vScrollBar.hideFlags |= HideFlags.HideAndDontSave;
                this._vScrollBar.visible = this._barDisplay != ScrollBarDisplay.OnScroll;
                this._owner._addChild(this._vScrollBar);
                this.onSizeChanged();
            }
        }
        else if (this._vScrollBar) {
            this._vScrollBar.destroy();
            this._vScrollBar = null;
            this.onSizeChanged();
        }
    }

    private createHzScrollBar() {
        if (!this._owner)
            return;

        if (this._barDisplay != ScrollBarDisplay.Hidden && (this._dir == ScrollDirection.Both || this._dir == ScrollDirection.Horizontal)) {
            if (this._hScrollBar && !this._hScrollBar._getBit(NodeFlags.LOCK_BY_EDITOR))
                return;

            let res = this._hScrollBarRes ? this._hScrollBarRes : UIConfig2.horizontalScrollBar;
            if (res) {
                this._hScrollBar = <GScrollBar>res.create();
                if (!this._hScrollBar) {
                    console.warn("failed to create a horizontal scrollbar");
                    return;
                }
                this._hScrollBar.hideFlags |= HideFlags.HideAndDontSave;
                this._hScrollBar.visible = this._barDisplay != ScrollBarDisplay.OnScroll;
                this._owner._addChild(this._hScrollBar);
                this.onSizeChanged();
            }
        }
        else if (this._hScrollBar) {
            this._hScrollBar.destroy();
            this._hScrollBar = null;
            this.onSizeChanged();
        }
    }

    private createHeader() {
        if (this._header) {
            this._header.destroy();
            this._header = null;
        }
        if (this._headerRes) {
            this._header = <GWidget>this._headerRes.create();
            if (this._header)
                this._header.hideFlags |= HideFlags.HideAndDontSave;
        }

        if (this._header || this._footer)
            this._refreshBarAxis = (this._dir == ScrollDirection.Both || this._dir == ScrollDirection.Vertical) ? "y" : "x";
        else
            this._refreshBarAxis = null;
    }

    private createFooter() {
        if (this._footer) {
            this._footer.destroy();
            this._footer = null;
        }
        if (this._footerRes) {
            this._footer = <GWidget>this._footerRes.create();
            if (this._footer)
                this._footer.hideFlags |= HideFlags.HideAndDontSave;
        }

        if (this._header || this._footer)
            this._refreshBarAxis = (this._dir == ScrollDirection.Both || this._dir == ScrollDirection.Vertical) ? "y" : "x";
        else
            this._refreshBarAxis = null;
    }

    public lockHeader(size: number): void {
        if (this._headerLockedSize == size)
            return;

        this._headerLockedSize = size;

        if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] >= 0) {
            this._tweenStart.setTo(this._container.x, this._container.y);
            this._tweenChange.setTo(0, 0);
            this._tweenChange[this._refreshBarAxis] = this._headerLockedSize - this._tweenStart[this._refreshBarAxis];
            this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
            this.startTween(2);
        }
    }

    public lockFooter(size: number): void {
        if (this._footerLockedSize == size)
            return;

        this._footerLockedSize = size;

        if (!this._refreshEventDispatching && this._container[this._refreshBarAxis] <= -this._overlapSize[this._refreshBarAxis]) {
            this._tweenStart.setTo(this._container.x, this._container.y);
            this._tweenChange.setTo(0, 0);
            let max: number = this._overlapSize[this._refreshBarAxis];
            if (max == 0)
                max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
            else
                max += this._footerLockedSize;
            this._tweenChange[this._refreshBarAxis] = -max - this._tweenStart[this._refreshBarAxis];
            this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
            this.startTween(2);
        }
    }

    _shouldCheckOverflow() {
        if (this._barDisplay == ScrollBarDisplay.OnOverflow || this._barDisplay == ScrollBarDisplay.OnOverflowAndScroll)
            return (this._vScrollBar != null ? 1 : 0) + (this._hScrollBar != null ? 2 : 0);
        else
            return null;
    }

    _processClipping() {
        if (this._owner)
            this._maskContainer.scrollRect = (!this._paddingMaskDisabled && this._owner.clipping) ? this._cachedScrollRect : null;
    }

    public _ownerSizeChanged() {
        this.onSizeChanged();
        this.posChanged(false);
    }

    private onSizeChanged(): void {
        if (!this._owner)
            return;

        let aWidth = this._owner.width;
        let aHeight = this._owner.height;

        let padding = this._layout.padding;
        let mx: number, my: number;
        if (this._barOnLeft && this._vScrollBar && !this._barFloating)
            mx = Math.floor(padding[3] + this._vScrollBar.width);
        else
            mx = Math.floor(padding[3]);
        my = Math.floor(padding[0]);

        this._maskContainer.pos(mx, my);

        if (this._hScrollBar) {
            this._hScrollBar.y = aHeight - this._hScrollBar.height;
            if (this._vScrollBar) {
                this._hScrollBar.width = aWidth - this._vScrollBar.width - this._barMargin[3] - this._barMargin[1];
                if (this._barOnLeft)
                    this._hScrollBar.x = this._barMargin[3] + this._vScrollBar.width;
                else
                    this._hScrollBar.x = this._barMargin[3];
            }
            else {
                this._hScrollBar.width = aWidth - this._barMargin[3] - this._barMargin[1];
                this._hScrollBar.x = this._barMargin[3];
            }
        }
        if (this._vScrollBar) {
            if (!this._barOnLeft)
                this._vScrollBar.x = aWidth - this._vScrollBar.width;
            if (this._hScrollBar)
                this._vScrollBar.height = aHeight - this._hScrollBar.height - this._barMargin[0] - this._barMargin[2];
            else
                this._vScrollBar.height = aHeight - this._barMargin[0] - this._barMargin[2];
            this._vScrollBar.y = this._barMargin[0];
        }

        this._viewSize.x = aWidth;
        this._viewSize.y = aHeight;
        if (this._hScrollBar && !this._barFloating)
            this._viewSize.y -= this._hScrollBar.height;
        if (this._vScrollBar && !this._barFloating)
            this._viewSize.x -= this._vScrollBar.width;
        this._viewSize.x -= (padding[3] + padding[1]);
        this._viewSize.y -= (padding[0] + padding[2]);
        this._viewSize.x = Math.max(1, this._viewSize.x);
        this._viewSize.y = Math.max(1, this._viewSize.y);
        this._pageSize.x = this._viewSize.x;
        this._pageSize.y = this._viewSize.y;

        this.onContentSizeChanged();
    }

    public _ownerContentSizeChanged(): void {
        let aWidth = this._layout.contentWidth;
        let aHeight = this._layout.contentHeight;
        if (this._contentSize.x == aWidth && this._contentSize.y == aHeight)
            return;

        this._contentSize.x = aWidth;
        this._contentSize.y = aHeight;
        this.onContentSizeChanged();
    }

    public _changeContentSizeOnScrolling(deltaWidth: number, deltaHeight: number,
        deltaPosX: number, deltaPosY: number): void {
        let isRightmost: boolean = this._xPos != 0 && this._xPos == this._overlapSize.x;
        let isBottom: boolean = this._yPos != 0 && this._yPos == this._overlapSize.y;

        this._contentSize.x += deltaWidth;
        this._contentSize.y += deltaHeight;
        this.onContentSizeChanged();

        if (this._tweening == 1) {
            //如果原来滚动位置是贴边，加入处理继续贴边。
            if (deltaWidth != 0 && isRightmost && this._tweenChange.x < 0) {
                this._xPos = this._overlapSize.x;
                this._tweenChange.x = -this._xPos - this._tweenStart.x;
            }

            if (deltaHeight != 0 && isBottom && this._tweenChange.y < 0) {
                this._yPos = this._overlapSize.y;
                this._tweenChange.y = -this._yPos - this._tweenStart.y;
            }
        }
        else if (this._tweening == 2) {
            //重新调整起始位置，确保能够顺滑滚下去
            if (deltaPosX != 0) {
                this._container.x -= deltaPosX;
                this._tweenStart.x -= deltaPosX;
                this._xPos = -this._container.x;
            }
            if (deltaPosY != 0) {
                this._container.y -= deltaPosY;
                this._tweenStart.y -= deltaPosY;
                this._yPos = -this._container.y;
            }
        }
        else if (this._dragged) {
            if (deltaPosX != 0) {
                this._container.x -= deltaPosX;
                this._containerPos.x -= deltaPosX;
                this._xPos = -this._container.x;
            }
            if (deltaPosY != 0) {
                this._container.y -= deltaPosY;
                this._containerPos.y -= deltaPosY;
                this._yPos = -this._container.y;
            }
        }
        else {
            //如果原来滚动位置是贴边，加入处理继续贴边。
            if (deltaWidth != 0 && isRightmost) {
                this._xPos = this._overlapSize.x;
                this._container.x = -this._xPos;
            }

            if (deltaHeight != 0 && isBottom) {
                this._yPos = this._overlapSize.y;
                this._container.y = -this._yPos;
            }
        }
    }

    private onContentSizeChanged(): void {
        if (!this._owner)
            return;

        if (this._barDisplay == ScrollBarDisplay.OnOverflow || this._barDisplay == ScrollBarDisplay.OnOverflowAndScroll) {
            this._vScrollNone = this._contentSize.y <= this._viewSize.y;
            this._hScrollNone = this._contentSize.x <= this._viewSize.x;

            if (this._vScrollBar && this._hScrollBar) {
                if (!this._hScrollNone)
                    this._vScrollBar.height = this._owner.height - this._hScrollBar.height - this._barMargin[0] - this._barMargin[2];
                else
                    this._vScrollBar.height = this._owner.height - this._barMargin[0] - this._barMargin[2];

                if (!this._vScrollNone)
                    this._hScrollBar.width = this._owner.width - this._vScrollBar.width - this._barMargin[3] - this._barMargin[1];
                else
                    this._hScrollBar.width = this._owner.width - this._barMargin[3] - this._barMargin[1];
            }
        }

        if (this._vScrollBar) {
            if (this._contentSize.y == 0)
                this._vScrollBar.setDisplayPerc(0);
            else
                this._vScrollBar.setDisplayPerc(Math.min(1, this._viewSize.y / this._contentSize.y));
        }
        if (this._hScrollBar) {
            if (this._contentSize.x == 0)
                this._hScrollBar.setDisplayPerc(0);
            else
                this._hScrollBar.setDisplayPerc(Math.min(1, this._viewSize.x / this._contentSize.x));
        }

        this._updateScrollBarVisible();

        let mw: number = this._viewSize.x;
        let mh: number = this._viewSize.y;
        if (this._vScrollNone && this._vScrollBar != null)
            mw += this._vScrollBar.width;
        if (this._hScrollNone && this._hScrollBar != null)
            mh += this._hScrollBar.height;
        this._maskContainer.size(mw, mh);
        this._cachedScrollRect.setTo(0, 0, mw, mh);

        if (this._dir == ScrollDirection.Horizontal || this._dir == ScrollDirection.Both)
            this._overlapSize.x = Math.ceil(Math.max(0, this._contentSize.x - this._viewSize.x));
        else
            this._overlapSize.x = 0;
        if (this._dir == ScrollDirection.Vertical || this._dir == ScrollDirection.Both)
            this._overlapSize.y = Math.ceil(Math.max(0, this._contentSize.y - this._viewSize.y));
        else
            this._overlapSize.y = 0;

        //边界检查
        this._xPos = MathUtil.clamp(this._xPos, 0, this._overlapSize.x);
        this._yPos = MathUtil.clamp(this._yPos, 0, this._overlapSize.y);
        if (this._refreshBarAxis) {
            let max: number = this._overlapSize[this._refreshBarAxis];
            if (max == 0)
                max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
            else
                max += this._footerLockedSize;

            if (this._refreshBarAxis == "x") {
                this._container.pos(MathUtil.clamp(this._container.x, -max, this._headerLockedSize),
                    MathUtil.clamp(this._container.y, -this._overlapSize.y, 0));
            }
            else {
                this._container.pos(MathUtil.clamp(this._container.x, -this._overlapSize.x, 0),
                    MathUtil.clamp(this._container.y, -max, this._headerLockedSize));
            }

            if (this._header) {
                if (this._refreshBarAxis == "x")
                    this._header.height = this._viewSize.y;
                else
                    this._header.width = this._viewSize.x;
            }

            if (this._footer) {
                if (this._refreshBarAxis == "y")
                    this._footer.height = this._viewSize.y;
                else
                    this._footer.width = this._viewSize.x;
            }
        }
        else {
            this._container.pos(MathUtil.clamp(this._container.x, -this._overlapSize.x, 0),
                MathUtil.clamp(this._container.y, -this._overlapSize.y, 0));
        }

        this.updateScrollBarPos();
    }

    private posChanged(ani: boolean): void {
        if (this._aniFlag == 0)
            this._aniFlag = ani ? 1 : -1;
        else if (this._aniFlag == 1 && !ani)
            this._aniFlag = -1;

        this._needRefresh = true;
        ILaya.timer.callLater(this, this.refresh);
    }

    private refresh(): void {
        if (this._owner == null)
            return;

        this._needRefresh = false;
        ILaya.timer.clear(this, this.refresh);

        if (this._pageMode || this._snapToItem) {
            s_endPos.setTo(-this._xPos, -this._yPos);
            this.alignPosition(s_endPos, false);
            this._xPos = -s_endPos.x;
            this._yPos = -s_endPos.y;
        }

        this.refresh2();

        this._owner.event(UIEventType.scroll);
        if (this._needRefresh) //在onScroll事件里开发者可能修改位置，这里再刷新一次，避免闪烁
        {
            this._needRefresh = false;
            ILaya.timer.clear(this, this.refresh);

            this.refresh2();
        }

        this.updateScrollBarPos();
        this._aniFlag = 0;
    }

    private refresh2(): void {
        if (this._aniFlag == 1 && !this._dragged) {
            let posX: number;
            let posY: number;

            if (this._overlapSize.x > 0)
                posX = -Math.floor(this._xPos);
            else {
                if (this._container.x != 0)
                    this._container.x = 0;
                posX = 0;
            }
            if (this._overlapSize.y > 0)
                posY = -Math.floor(this._yPos);
            else {
                if (this._container.y != 0)
                    this._container.y = 0;
                posY = 0;
            }

            if (posX != this._container.x || posY != this._container.y) {
                this._tweenDuration.setTo(TWEEN_TIME_GO, TWEEN_TIME_GO);
                this._tweenStart.setTo(this._container.x, this._container.y);
                this._tweenChange.setTo(posX - this._tweenStart.x, posY - this._tweenStart.y);
                this.startTween(1);
            }
            else if (this._tweening != 0)
                this.killTween();
        }
        else {
            if (this._tweening != 0)
                this.killTween();


            this._container.pos(Math.floor(-this._xPos), Math.floor(-this._yPos));

            this.loopCheckingCurrent();
        }
    }

    private _touchBegin(evt: Event): void {
        if (!this._touchEffect || this._touchEffectButton != evt.button)
            return;

        if (this._tweening != 0) {
            this.killTween();
            InputManager.cancelClick(evt.touchId);
            this._dragged = true;
        }
        else
            this._dragged = false;

        let pt: Point = this._owner.globalToLocal(s_Point.copy(evt.touchPos));

        this._containerPos.setTo(this._container.x, this._container.y);
        this._beginTouchPos.setTo(pt.x, pt.y);
        this._lastTouchPos.setTo(pt.x, pt.y);
        this._lastTouchGlobalPos.copy(evt.touchPos);
        this._isHoldAreaDone = false;
        this._velocity.setTo(0, 0);
        this._velocityScale = 1;
        this._lastMoveTime = performance.now() / 1000;
    }

    private _touchMove(evt: Event): void {
        if (!this._touchEffect || this.owner.destroyed)
            return;

        if (Scroller.draggingInst && Scroller.draggingInst != this || DragSupport.draggingInst) //已经有其他拖动
            return;

        let sensitivity: number = UIConfig2.touchScrollSensitivity;

        let pt: Point = this._owner.globalToLocal(s_Point.copy(evt.touchPos));

        let diff: number;
        let sv: boolean, sh: boolean;

        if (this._dir == ScrollDirection.Vertical) {
            if (!this._isHoldAreaDone) {
                //表示正在监测垂直方向的手势
                s_gestureFlag |= 1;

                diff = Math.abs(this._beginTouchPos.y - pt.y);
                if (diff < sensitivity)
                    return;

                if ((s_gestureFlag & 2) != 0) //已经有水平方向的手势在监测，那么我们用严格的方式检查是不是按垂直方向移动，避免冲突
                {
                    let diff2 = Math.abs(this._beginTouchPos.x - pt.x);
                    if (diff < diff2) //不通过则不允许滚动了
                        return;
                }
            }

            sv = true;
        }
        else if (this._dir == ScrollDirection.Horizontal) {
            if (!this._isHoldAreaDone) {
                s_gestureFlag |= 2;

                diff = Math.abs(this._beginTouchPos.x - pt.x);
                if (diff < sensitivity)
                    return;

                if ((s_gestureFlag & 1) != 0) {
                    let diff2 = Math.abs(this._beginTouchPos.y - pt.y);
                    if (diff < diff2)
                        return;
                }
            }

            sh = true;
        }
        else {
            s_gestureFlag = 3;

            if (!this._isHoldAreaDone) {
                diff = Math.abs(this._beginTouchPos.y - pt.y);
                if (diff < sensitivity) {
                    diff = Math.abs(this._beginTouchPos.x - pt.x);
                    if (diff < sensitivity)
                        return;
                }
            }

            sv = sh = true;
        }

        let newPosX: number = Math.floor(this._containerPos.x + pt.x - this._beginTouchPos.x);
        let newPosY: number = Math.floor(this._containerPos.y + pt.y - this._beginTouchPos.y);

        if (sv) {
            if (newPosY > 0) {
                if (!this._bouncebackEffect)
                    this._container.y = 0;
                else
                    this._container.y = Math.floor(Math.min(newPosY * 0.5, this._viewSize.y * PULL_RATIO));
            }
            else if (newPosY < -this._overlapSize.y) {
                if (!this._bouncebackEffect)
                    this._container.y = -this._overlapSize.y;
                else
                    this._container.y = Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._viewSize.y * PULL_RATIO) - this._overlapSize.y);
            }
            else
                this._container.y = newPosY;
        }

        if (sh) {
            if (newPosX > 0) {
                if (!this._bouncebackEffect)
                    this._container.x = 0;
                else
                    this._container.x = Math.floor(Math.min(newPosX * 0.5, this._viewSize.x * PULL_RATIO));
            }
            else if (newPosX < 0 - this._overlapSize.x) {
                if (!this._bouncebackEffect)
                    this._container.x = -this._overlapSize.x;
                else
                    this._container.x = Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._viewSize.x * PULL_RATIO) - this._overlapSize.x);
            }
            else
                this._container.x = newPosX;
        }

        //更新速度
        let frameRate: number = 60;
        let now: number = performance.now() / 1000;
        let deltaTime: number = Math.max(now - this._lastMoveTime, 1 / frameRate);
        let deltaPositionX: number = pt.x - this._lastTouchPos.x;
        let deltaPositionY: number = pt.y - this._lastTouchPos.y;
        if (!sh)
            deltaPositionX = 0;
        if (!sv)
            deltaPositionY = 0;
        if (deltaTime != 0) {
            let elapsed: number = deltaTime * frameRate - 1;
            if (elapsed > 1) {//速度衰减
                let factor: number = Math.pow(0.833, elapsed);
                this._velocity.x = this._velocity.x * factor;
                this._velocity.y = this._velocity.y * factor;
            }
            this._velocity.x = MathUtil.lerp(this._velocity.x, deltaPositionX * 60 / frameRate / deltaTime, deltaTime * 10);
            this._velocity.y = MathUtil.lerp(this._velocity.y, deltaPositionY * 60 / frameRate / deltaTime, deltaTime * 10);
        }

        /*速度计算使用的是本地位移，但在后续的惯性滚动判断中需要用到屏幕位移，所以这里要记录一个位移的比例。
        */
        let deltaGlobalPositionX: number = this._lastTouchGlobalPos.x - evt.touchPos.x;
        let deltaGlobalPositionY: number = this._lastTouchGlobalPos.y - evt.touchPos.y;
        if (deltaPositionX != 0)
            this._velocityScale = Math.abs(deltaGlobalPositionX / deltaPositionX);
        else if (deltaPositionY != 0)
            this._velocityScale = Math.abs(deltaGlobalPositionY / deltaPositionY);

        this._lastTouchPos.setTo(pt.x, pt.y);
        this._lastTouchGlobalPos.copy(evt.touchPos);
        this._lastMoveTime = now;

        //同步更新pos值
        if (this._overlapSize.x > 0)
            this._xPos = MathUtil.clamp(-this._container.x, 0, this._overlapSize.x);
        if (this._overlapSize.y > 0)
            this._yPos = MathUtil.clamp(-this._container.y, 0, this._overlapSize.y);

        //循环滚动特别检查
        if (this._loop != 0) {
            newPosX = this._container.x;
            newPosY = this._container.y;
            if (this.loopCheckingCurrent()) {
                this._containerPos.x += this._container.x - newPosX;
                this._containerPos.y += this._container.y - newPosY;
            }
        }

        Scroller.draggingInst = this;
        this._isHoldAreaDone = true;
        this._dragged = true;

        this.updateScrollBarPos();
        this._updateScrollBarVisible();

        this._owner.event(UIEventType.scroll);
    }

    private _touchEnd(): void {
        if (Scroller.draggingInst == this)
            Scroller.draggingInst = null;

        s_gestureFlag = 0;

        if (!this._dragged || !this._touchEffect) {
            this._dragged = false;
            return;
        }

        this._dragged = false;

        this._tweenStart.setTo(this._container.x, this._container.y);

        s_endPos.setTo(this._tweenStart.x, this._tweenStart.y);
        let flag: boolean = false;
        if (this._container.x > 0) {
            s_endPos.x = 0;
            flag = true;
        }
        else if (this._container.x < -this._overlapSize.x) {
            s_endPos.x = -this._overlapSize.x;
            flag = true;
        }
        if (this._container.y > 0) {
            s_endPos.y = 0;
            flag = true;
        }
        else if (this._container.y < -this._overlapSize.y) {
            s_endPos.y = -this._overlapSize.y;
            flag = true;
        }
        if (flag) {
            this._tweenChange.setTo(s_endPos.x - this._tweenStart.x, s_endPos.y - this._tweenStart.y);
            if (this._tweenChange.x < -UIConfig2.touchDragSensitivity || this._tweenChange.y < -UIConfig2.touchDragSensitivity) {
                this._refreshEventDispatching = true;
                this._owner.event(UIEventType.pull_down_release);
                this._refreshEventDispatching = false;
            }
            else if (this._tweenChange.x > UIConfig2.touchDragSensitivity || this._tweenChange.y > UIConfig2.touchDragSensitivity) {
                this._refreshEventDispatching = true;
                this._owner.event(UIEventType.pull_up_release);
                this._refreshEventDispatching = false;
            }

            if (this._headerLockedSize > 0 && s_endPos[this._refreshBarAxis] == 0) {
                s_endPos[this._refreshBarAxis] = this._headerLockedSize;
                this._tweenChange.x = s_endPos.x - this._tweenStart.x;
                this._tweenChange.y = s_endPos.y - this._tweenStart.y;
            }
            else if (this._footerLockedSize > 0 && s_endPos[this._refreshBarAxis] == -this._overlapSize[this._refreshBarAxis]) {
                let max: number = this._overlapSize[this._refreshBarAxis];
                if (max == 0)
                    max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                else
                    max += this._footerLockedSize;
                s_endPos[this._refreshBarAxis] = -max;
                this._tweenChange.x = s_endPos.x - this._tweenStart.x;
                this._tweenChange.y = s_endPos.y - this._tweenStart.y;
            }

            this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
        }
        else {
            //更新速度
            if (!this._inertiaDisabled) {
                let frameRate: number = 60;
                let elapsed: number = (performance.now() / 1000 - this._lastMoveTime) * frameRate - 1;
                if (elapsed > 1) {
                    let factor: number = Math.pow(0.833, elapsed);
                    this._velocity.x = this._velocity.x * factor;
                    this._velocity.y = this._velocity.y * factor;
                }
                //根据速度计算目标位置和需要时间
                this.updateTargetAndDuration(this._tweenStart, s_endPos);
            }
            else
                this._tweenDuration.setTo(TWEEN_TIME_DEFAULT, TWEEN_TIME_DEFAULT);
            s_oldChange.setTo(s_endPos.x - this._tweenStart.x, s_endPos.y - this._tweenStart.y);

            //调整目标位置
            this.loopCheckingTarget(s_endPos);
            if (this._pageMode || this._snapToItem)
                this.alignPosition(s_endPos, true);

            this._tweenChange.x = s_endPos.x - this._tweenStart.x;
            this._tweenChange.y = s_endPos.y - this._tweenStart.y;
            if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
                this._updateScrollBarVisible();
                return;
            }

            //如果目标位置已调整，随之调整需要时间
            if (this._pageMode || this._snapToItem) {
                this.fixDuration("x", s_oldChange.x);
                this.fixDuration("y", s_oldChange.y);
            }
        }

        this.startTween(2);
    }

    private _mouseWheel(evt: Event): void {
        if (this._mouseWheelDisabled || this._barDisplay == ScrollBarDisplay.Hidden)
            return;

        let delta: number = evt.delta;
        if (this._snapToItem && Math.abs(delta) < 1)
            delta = Math.sign(delta);

        if (this._overlapSize.x > 0 && this._overlapSize.y == 0) {
            let step: number = this._pageMode ? this._pageSize.x : this._step;
            this.setPosX(this._xPos + step * delta, false);
            evt.stopPropagation();
        }
        else {
            let step: number = this._pageMode ? this._pageSize.y : this._step;
            this.setPosY(this._yPos + step * delta, false);
            evt.stopPropagation();
        }
    }

    private _rollOver() {
        this._hover = true;
        if (this._barDisplay == ScrollBarDisplay.OnScroll || this._barDisplay == ScrollBarDisplay.OnOverflowAndScroll)
            this._updateScrollBarVisible();
    }

    private _rollOut() {
        this._hover = false;
        if (this._barDisplay == ScrollBarDisplay.OnScroll || this._barDisplay == ScrollBarDisplay.OnOverflowAndScroll)
            this._updateScrollBarVisible();
    }

    private updateScrollBarPos(): void {
        if (this._vScrollBar)
            this._vScrollBar.setScrollPerc(this._overlapSize.y == 0 ? 0 : MathUtil.clamp(-this._container.y, 0, this._overlapSize.y) / this._overlapSize.y);

        if (this._hScrollBar)
            this._hScrollBar.setScrollPerc(this._overlapSize.x == 0 ? 0 : MathUtil.clamp(-this._container.x, 0, this._overlapSize.x) / this._overlapSize.x);

        this.checkRefreshBar();
    }

    _updateScrollBarVisible(): void {
        if (this._vScrollBar) {
            if (this._viewSize.y <= this._vScrollBar.minSize || this._vScrollNone)
                this._vScrollBar.visible = false;
            else
                this.updateScrollBarVisible2(this._vScrollBar);
        }

        if (this._hScrollBar) {
            if (this._viewSize.x <= this._hScrollBar.minSize || this._hScrollNone)
                this._hScrollBar.visible = false;
            else
                this.updateScrollBarVisible2(this._hScrollBar);
        }
    }

    private updateScrollBarVisible2(bar: GScrollBar): void {
        let flag = this._barDisplay == ScrollBarDisplay.OnScroll || this._barDisplay == ScrollBarDisplay.OnOverflowAndScroll;
        if (flag)
            Tween.killAll(bar);

        if (flag && !this._hover && this._tweening == 0 && !this._dragged && !bar.gripDragging) {
            if (bar.visible)
                Tween.create(bar).go("alpha", 1, 0).duration(0.5).delay(0.5).then(this._barTweenComplete, this);
        }
        else {
            bar.alpha = 1;
            bar.visible = true;
        }
    }

    private _barTweenComplete(tweener: ITweener): void {
        let bar: GWidget = tweener.target;
        bar.alpha = 1;
        bar.visible = false;
    }

    private getLoopPartSize(division: number, axis: AxisType): number {
        let list: any = this._owner; //assume it is a list
        return (this._contentSize[axis] + (axis == "x" ? list.columnGap : list.lineGap)) / division;
    }

    private loopCheckingCurrent(): boolean {
        let changed: boolean = false;
        if (this._loop == 1 && this._overlapSize.x > 0) {
            if (this._xPos < 0.001) {
                this._xPos += this.getLoopPartSize(2, "x");
                changed = true;
            }
            else if (this._xPos >= this._overlapSize.x) {
                this._xPos -= this.getLoopPartSize(2, "x");
                changed = true;
            }
        }
        else if (this._loop == 2 && this._overlapSize.y > 0) {
            if (this._yPos < 0.001) {
                this._yPos += this.getLoopPartSize(2, "y");
                changed = true;
            }
            else if (this._yPos >= this._overlapSize.y) {
                this._yPos -= this.getLoopPartSize(2, "y");
                changed = true;
            }
        }

        if (changed)
            this._container.pos(Math.floor(-this._xPos), Math.floor(-this._yPos));

        return changed;
    }

    private loopCheckingTarget(endPos: Point): void {
        if (this._loop == 1)
            this.loopCheckingTarget2(endPos, "x");

        if (this._loop == 2)
            this.loopCheckingTarget2(endPos, "y");
    }

    private loopCheckingTarget2(endPos: Point, axis: AxisType): void {
        let halfSize: number;
        let tmp: number;
        if (endPos[axis] > 0) {
            halfSize = this.getLoopPartSize(2, axis);
            tmp = this._tweenStart[axis] - halfSize;
            if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
                endPos[axis] -= halfSize;
                this._tweenStart[axis] = tmp;
            }
        }
        else if (endPos[axis] < -this._overlapSize[axis]) {
            halfSize = this.getLoopPartSize(2, axis);
            tmp = this._tweenStart[axis] + halfSize;
            if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
                endPos[axis] += halfSize;
                this._tweenStart[axis] = tmp;
            }
        }
    }

    private loopCheckingNewPos(value: number, axis: AxisType): number {
        if (this._overlapSize[axis] == 0)
            return value;

        let pos: number = axis == "x" ? this._xPos : this._yPos;
        let changed: boolean = false;
        let v: number;
        if (value < 0.001) {
            value += this.getLoopPartSize(2, axis);
            if (value > pos) {
                v = this.getLoopPartSize(6, axis);
                v = Math.ceil((value - pos) / v) * v;
                pos = MathUtil.clamp(pos + v, 0, this._overlapSize[axis]);
                changed = true;
            }
        }
        else if (value >= this._overlapSize[axis]) {
            value -= this.getLoopPartSize(2, axis);
            if (value < pos) {
                v = this.getLoopPartSize(6, axis);
                v = Math.ceil((pos - value) / v) * v;
                pos = MathUtil.clamp(pos - v, 0, this._overlapSize[axis]);
                changed = true;
            }
        }

        if (changed) {
            if (axis == "x")
                this._container.x = -Math.floor(pos);
            else
                this._container.y = -Math.floor(pos);
        }

        return value;
    }

    private alignPosition(pos: Point, inertialScrolling: boolean): void {
        if (this._pageMode) {
            pos.x = this.alignByPage(pos.x, "x", inertialScrolling);
            pos.y = this.alignByPage(pos.y, "y", inertialScrolling);
        }
        else if (this._snapToItem) {
            let xDir = 0;
            let yDir = 0;
            if (inertialScrolling) {
                xDir = pos.x - this._containerPos.x;
                yDir = pos.y - this._containerPos.y;
            }

            let pt = this._layout.getSnappingPosition(-pos.x, -pos.y, xDir, yDir, s_Point);
            if (pos.x < 0 && pos.x > -this._overlapSize.x)
                pos.x = -pt.x;
            if (pos.y < 0 && pos.y > -this._overlapSize.y)
                pos.y = -pt.y;
        }
    }

    private alignByPage(pos: number, axis: AxisType, inertialScrolling: boolean): number {
        let page: number;

        if (pos > 0)
            page = 0;
        else if (pos < -this._overlapSize[axis])
            page = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
        else {
            page = Math.floor(-pos / this._pageSize[axis]);
            let change: number = inertialScrolling ? (pos - this._containerPos[axis]) : (pos - this._container[axis]);
            let testPageSize: number = Math.min(this._pageSize[axis], this._contentSize[axis] - (page + 1) * this._pageSize[axis]);
            let delta: number = -pos - page * this._pageSize[axis];

            //页面吸附策略
            if (Math.abs(change) > this._pageSize[axis])//如果滚动距离超过1页,则需要超过页面的一半，才能到更下一页
            {
                if (delta > testPageSize * 0.5)
                    page++;
            }
            else //否则只需要页面的1/3，当然，需要考虑到左移和右移的情况
            {
                if (delta > testPageSize * (change < 0 ? UIConfig2.defaultScrollPagingThreshold : (1 - UIConfig2.defaultScrollPagingThreshold)))
                    page++;
            }

            //重新计算终点
            pos = -page * this._pageSize[axis];
            if (pos < -this._overlapSize[axis]) //最后一页未必有pageSize那么大
                pos = -this._overlapSize[axis];
        }

        //惯性滚动模式下，会增加判断尽量不要滚动超过一页
        if (inertialScrolling) {
            let oldPos = this._tweenStart[axis];
            let oldPage: number;
            if (oldPos > 0)
                oldPage = 0;
            else if (oldPos < -this._overlapSize[axis])
                oldPage = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
            else
                oldPage = Math.floor(-oldPos / this._pageSize[axis]);
            let startPage = Math.floor(-this._containerPos[axis] / this._pageSize[axis]);
            if (Math.abs(page - startPage) > 1 && Math.abs(oldPage - startPage) <= 1) {
                if (page > startPage)
                    page = startPage + 1;
                else
                    page = startPage - 1;
                pos = -page * this._pageSize[axis];
            }
        }

        return pos;
    }

    private updateTargetAndDuration(orignPos: Point, resultPos: Point): void {
        resultPos.x = this.updateTargetAndDuration2(orignPos.x, "x");
        resultPos.y = this.updateTargetAndDuration2(orignPos.y, "y");
    }

    private updateTargetAndDuration2(pos: number, axis: AxisType): number {
        let v = this._velocity[axis];
        let duration = 0;
        if (pos > 0)
            pos = 0;
        else if (pos < -this._overlapSize[axis])
            pos = -this._overlapSize[axis];
        else {
            //以屏幕像素为基准
            let v2 = Math.abs(v) * this._velocityScale;
            //在移动设备上，需要对不同分辨率做一个适配，我们的速度判断以1136分辨率为基准
            if (Browser.isTouchDevice)
                v2 *= 1136 / Math.max(window.screen.width, window.screen.height);
            //这里有一些阈值的处理，因为在低速内，不希望产生较大的滚动（甚至不滚动）
            let ratio = 0;
            if (this._pageMode || !Browser.isTouchDevice) {
                if (v2 > 500)
                    ratio = Math.pow((v2 - 500) / 500, 2);
            }
            else {
                if (v2 > 1000)
                    ratio = Math.pow((v2 - 1000) / 1000, 2);
            }
            if (ratio != 0) {
                if (ratio > 1)
                    ratio = 1;

                v2 *= ratio;
                v *= ratio;
                this._velocity[axis] = v;

                //算法：v*（_decelerationRate的n次幂）= 60，即在n帧后速度降为60（假设每秒60帧）。
                duration = Math.log(60 / v2) / Math.log(this._decelerationRate) / 60;

                //计算距离要使用本地速度
                //理论公式貌似滚动的距离不够，改为经验公式
                //let change:number = (v/ 60 - 1) / (1 - this._decelerationRate);
                let change = Math.floor(v * duration * 0.4);
                pos += change;
            }
        }

        if (duration < TWEEN_TIME_DEFAULT)
            duration = TWEEN_TIME_DEFAULT;
        this._tweenDuration[axis] = duration;

        return pos;
    }

    private fixDuration(axis: AxisType, oldChange: number): void {
        if (this._tweenChange[axis] == 0 || Math.abs(this._tweenChange[axis]) >= Math.abs(oldChange))
            return;

        let newDuration: number = Math.abs(this._tweenChange[axis] / oldChange) * this._tweenDuration[axis];
        if (newDuration < TWEEN_TIME_DEFAULT)
            newDuration = TWEEN_TIME_DEFAULT;

        this._tweenDuration[axis] = newDuration;
    }

    private startTween(type: number): void {
        this._tweenTime.setTo(0, 0);
        this._tweening = type;
        ILaya.timer.frameLoop(1, this, this.tweenUpdate);
        this._updateScrollBarVisible();
    }

    private killTween(): void {
        if (this._tweening == 1) //取消类型为1的tween需立刻设置到终点
        {
            this._container.pos(this._tweenStart.x + this._tweenChange.x, this._tweenStart.y + this._tweenChange.y);
            this._owner.event(UIEventType.scroll);
        }

        this._tweening = 0;
        ILaya.timer.clear(this, this.tweenUpdate);

        this._updateScrollBarVisible();

        this._owner.event(UIEventType.scroll_end);
    }

    private checkRefreshBar(): void {
        if (this._header == null && this._footer == null)
            return;

        let pos = this._container[this._refreshBarAxis];
        if (this._header) {
            if (pos > 0) {
                if (!this._header.parent) {
                    this._maskContainer.addChildAt(this._header, this._maskContainer.getChildIndex(this._container));
                }
                let pt: Point = s_Point;
                pt.setTo(this._header.width, this._header.height);
                pt[this._refreshBarAxis] = pos;
                this._header.size(pt.x, pt.y);
            }
            else {
                this._header.removeSelf();
            }
        }

        if (this._footer) {
            let max = this._overlapSize[this._refreshBarAxis];
            if (pos < -max || max == 0 && this._footerLockedSize > 0) {
                if (!this._footer.parent) {
                    this._maskContainer.addChildAt(this._footer, this._maskContainer.getChildIndex(this._container));
                }

                let pt = s_Point;
                pt.setTo(this._footer.x, this._footer.y);
                if (max > 0)
                    pt[this._refreshBarAxis] = pos + this._contentSize[this._refreshBarAxis];
                else
                    pt[this._refreshBarAxis] = Math.max(Math.min(pos + this._viewSize[this._refreshBarAxis], this._viewSize[this._refreshBarAxis] - this._footerLockedSize),
                        this._viewSize[this._refreshBarAxis] - this._contentSize[this._refreshBarAxis]);
                this._footer.pos(pt.x, pt.y);

                pt.setTo(this._footer.width, this._footer.height);
                if (max > 0)
                    pt[this._refreshBarAxis] = -max - pos;
                else
                    pt[this._refreshBarAxis] = this._viewSize[this._refreshBarAxis] - this._footer[this._refreshBarAxis];
                this._footer.size(pt.x, pt.y);
            }
            else {
                this._footer.removeSelf();
            }
        }
    }

    private tweenUpdate(): void {
        let nx = this.runTween("x");
        let ny = this.runTween("y");

        this._container.pos(nx, ny);

        if (this._tweening == 2) {
            if (this._overlapSize.x > 0)
                this._xPos = MathUtil.clamp(-nx, 0, this._overlapSize.x);
            if (this._overlapSize.y > 0)
                this._yPos = MathUtil.clamp(-ny, 0, this._overlapSize.y);
        }

        if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
            this._tweening = 0;
            ILaya.timer.clear(this, this.tweenUpdate);

            this.loopCheckingCurrent();
            this.updateScrollBarPos();
            this._updateScrollBarVisible();

            this._owner.event(UIEventType.scroll);
            this._owner.event(UIEventType.scroll_end);

        }
        else {
            this.updateScrollBarPos();
            this._owner.event(UIEventType.scroll);
        }
    }

    private runTween(axis: AxisType): number {
        let newValue: number;
        if (this._tweenChange[axis] != 0) {
            this._tweenTime[axis] += ILaya.timer.delta / 1000;
            if (this._tweenTime[axis] >= this._tweenDuration[axis]) {
                newValue = this._tweenStart[axis] + this._tweenChange[axis];
                this._tweenChange[axis] = 0;
            }
            else {
                let ratio: number = easeFunc(this._tweenTime[axis], this._tweenDuration[axis]);
                newValue = this._tweenStart[axis] + Math.floor(this._tweenChange[axis] * ratio);
            }

            let threshold1: number = 0;
            let threshold2: number = -this._overlapSize[axis];
            if (this._headerLockedSize > 0 && this._refreshBarAxis == axis)
                threshold1 = this._headerLockedSize;
            if (this._footerLockedSize > 0 && this._refreshBarAxis == axis) {
                let max: number = this._overlapSize[this._refreshBarAxis];
                if (max == 0)
                    max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
                else
                    max += this._footerLockedSize;
                threshold2 = -max;
            }

            if (this._tweening == 2 && this._bouncebackEffect) {
                if (newValue > 20 + threshold1 && this._tweenChange[axis] > 0
                    || newValue > threshold1 && this._tweenChange[axis] == 0)//开始回弹
                {
                    this._tweenTime[axis] = 0;
                    this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
                    this._tweenChange[axis] = -newValue + threshold1;
                    this._tweenStart[axis] = newValue;
                }
                else if (newValue < threshold2 - 20 && this._tweenChange[axis] < 0
                    || newValue < threshold2 && this._tweenChange[axis] == 0)//开始回弹
                {
                    this._tweenTime[axis] = 0;
                    this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
                    this._tweenChange[axis] = threshold2 - newValue;
                    this._tweenStart[axis] = newValue;
                }
            }
            else {
                if (newValue > threshold1) {
                    newValue = threshold1;
                    this._tweenChange[axis] = 0;
                }
                else if (newValue < threshold2) {
                    newValue = threshold2;
                    this._tweenChange[axis] = 0;
                }
            }
        }
        else
            newValue = this._container[axis];

        return newValue;
    }
}

function easeFunc(t: number, d: number): number {
    return (t = t / d - 1) * t * t + 1;//cubicOut
}