import { GWidget } from "./GWidget";
import { IScroller } from "./IScroller";
import { Point } from "../maths/Point";
import { Event } from "../events/Event";

const MIN_GRIP_SIZE = 20;

export class GScrollBar extends GWidget {
    private _gripButton: GWidget;
    private _arrowButton1: GWidget;
    private _arrowButton2: GWidget;
    private _bar: GWidget;

    private _target: IScroller;

    private _vertical: boolean;
    private _scrollPerc: number = 0;
    private _fixedGripSize: boolean = false;

    private _dragOffset: Point;
    private _gripDragging: boolean;

    constructor() {
        super();

        this._dragOffset = new Point();

        this.on(Event.MOUSE_DOWN, this, this._barTouchBegin);
    }

    public setOwner(target: IScroller, vertical: boolean): void {
        this._target = target;
        this._vertical = vertical;
    }

    public setDisplayPerc(value: number) {
        if (this._vertical) {
            if (!this._fixedGripSize)
                this._gripButton.height = Math.max(Math.floor(value * this._bar.height), Math.min(MIN_GRIP_SIZE, this._bar.height));
            this._gripButton.y = this._bar.y + (this._bar.height - this._gripButton.height) * this._scrollPerc;

        }
        else {
            if (!this._fixedGripSize)
                this._gripButton.width = Math.max(Math.floor(value * this._bar.width), Math.min(MIN_GRIP_SIZE, this._bar.width));
            this._gripButton.x = this._bar.x + (this._bar.width - this._gripButton.width) * this._scrollPerc;
        }
        this._gripButton.visible = value != 0 && value != 1;
    }

    public setScrollPerc(val: number) {
        this._scrollPerc = val;
        if (this._vertical)
            this._gripButton.y = this._bar.y + (this._bar.height - this._gripButton.height) * this._scrollPerc;
        else
            this._gripButton.x = this._bar.x + (this._bar.width - this._gripButton.width) * this._scrollPerc;
    }

    public get minSize(): number {
        if (this._vertical)
            return (this._arrowButton1 ? this._arrowButton1.height : 0) + (this._arrowButton2 ? this._arrowButton2.height : 0);
        else
            return (this._arrowButton1 ? this._arrowButton1.width : 0) + (this._arrowButton2 ? this._arrowButton2.width : 0);
    }

    public get gripDragging(): boolean {
        return this._gripDragging;
    }

    public get fixedGripSize(): boolean {
        return this._fixedGripSize;
    }

    public set fixedGripSize(value: boolean) {
        this._fixedGripSize = value;
    }

    /** @internal */
    _onConstruct(inPrefab?: boolean): void {
        if (this._gripButton) {
            this._gripButton.on(Event.MOUSE_DOWN, this, this._gripTouchBegin);
            this._gripButton.on(Event.MOUSE_DRAG, this, this._gripTouchMove);
            this._gripButton.on(Event.MOUSE_UP, this, this._gripTouchEnd);
        }

        if (this._arrowButton1)
            this._arrowButton1.on(Event.MOUSE_DOWN, this, this._arrowButton1Click);
        if (this._arrowButton2)
            this._arrowButton2.on(Event.MOUSE_DOWN, this, this._arrowButton2Click);

        super._onConstruct(inPrefab);
    }

    _setup(arrowButton1: GWidget, arrowButton2: GWidget, bar: GWidget, grip: GWidget): void {
        this._arrowButton1 = arrowButton1;
        this._arrowButton2 = arrowButton2;
        this._bar = bar;
        this._gripButton = grip;

        this._onConstruct();
    }

    private _gripTouchBegin(evt: Event): void {
        if (!this._bar || !this._target)
            return;

        evt.stopPropagation();

        this._gripDragging = true;
        this._target._updateScrollBarVisible();

        this.globalToLocal(this._dragOffset.copy(evt.touchPos));
        this._dragOffset.x -= this._gripButton.x;
        this._dragOffset.y -= this._gripButton.y;
    }

    private _gripTouchMove(evt: Event): void {
        if (!this.displayedInStage || !this._target)
            return;

        let pt = this.globalToLocal(s_vec2.copy(evt.touchPos));
        if (this._vertical) {
            let curY: number = pt.y - this._dragOffset.y;
            let diff = this._bar.height - this._gripButton.height;
            if (diff == 0)
                this._target.percY = 0;
            else
                this._target.percY = (curY - this._bar.y) / diff;
        }
        else {
            let curX: number = pt.x - this._dragOffset.x;
            let diff = this._bar.width - this._gripButton.width;
            if (diff == 0)
                this._target.percX = 0;
            else
                this._target.percX = (curX - this._bar.x) / (this._bar.width - this._gripButton.width);
        }
    }

    private _gripTouchEnd(evt: Event): void {
        if (!this._target)
            return;

        this._gripDragging = false;
        this._target._updateScrollBarVisible();
    }

    private _arrowButton1Click(evt: Event): void {
        evt.stopPropagation();

        if (!this._target)
            return;

        if (this._vertical)
            this._target.scrollUp();
        else
            this._target.scrollLeft();
    }

    private _arrowButton2Click(evt: Event): void {
        evt.stopPropagation();

        if (!this._target)
            return;

        if (this._vertical)
            this._target.scrollDown();
        else
            this._target.scrollRight();
    }

    private _barTouchBegin(evt: Event): void {
        evt.stopPropagation();

        if (!this._target)
            return;

        let pt = this._gripButton.globalToLocal(s_vec2.copy(evt.touchPos));
        if (this._vertical) {
            if (pt.y < 0)
                this._target.scrollUp(4);
            else
                this._target.scrollDown(4);
        }
        else {
            if (pt.x < 0)
                this._target.scrollLeft(4);
            else
                this._target.scrollRight(4);
        }
    }
}

const s_vec2 = new Point();