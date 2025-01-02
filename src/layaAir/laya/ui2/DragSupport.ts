import { Input } from "../display/Input";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { InputManager } from "../events/InputManager";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Browser } from "../utils/Browser";
import { SpriteUtils } from "../utils/SpriteUtils";
import { UIConfig2 } from "./UIConfig";
import type { GWidget } from "./GWidget";

var _rect = new Rectangle();
var _vec2 = new Point();
var _globalDragStart = new Point();
var _globalRect = new Rectangle();
var draggingInst: GWidget;

export class DragSupport {
    private _owner: GWidget;
    private _dragStartPos = new Point();
    private _dragTesting = false;

    static get draggingInst() { return draggingInst; }

    constructor(owner: GWidget) {
        this._owner = owner;
    }

    public setAutoStart(value: boolean): void {
        let o = this._owner;
        if (value) {
            o.on(Event.MOUSE_DOWN, this, this._touchBegin);
            o.on(Event.MOUSE_DRAG, this, this._touchMove);
            o.on(Event.MOUSE_UP, this, this._touchEnd);
        }
        else {
            o.off(Event.MOUSE_DOWN, this, this._touchBegin);
            o.off(Event.MOUSE_DRAG, this, this._touchMove);
            o.off(Event.MOUSE_UP, this, this._touchEnd);
        }
    }

    public start(pointerId: number): void {
        if (draggingInst) {
            let tmp = draggingInst;
            draggingInst.stopDrag();
            draggingInst = null;
            tmp.event(Event.DRAG_END);
        }

        this._owner.on(Event.MOUSE_DRAG, this, this._touchMove);
        this._owner.on(Event.MOUSE_UP, this, this._touchEnd);

        _globalDragStart.copy(InputManager.getTouchPos(pointerId));
        SpriteUtils.localToGlobalRect(this._owner, _globalRect.setTo(0, 0, this._owner.width, this._owner.height));
        this._dragTesting = false;

        draggingInst = this._owner;
    }

    public stop(): void {
        if (draggingInst == this._owner) {
            this._dragTesting = false;
            draggingInst = null;
        }
    }

    private _touchBegin(evt: Event): void {
        if (Input.isInputting) {
            this._dragTesting = false;
            return;
        }

        if (this._dragStartPos == null)
            this._dragStartPos = new Point();
        this._dragStartPos.copy(evt.touchPos);
        this._dragTesting = true;
    }

    private _touchMove(evt: Event): void {
        if (this._dragTesting && draggingInst != this._owner) {
            let sensitivity: number;
            if (Browser.isTouchDevice)
                sensitivity = UIConfig2.touchDragSensitivity;
            else
                sensitivity = UIConfig2.clickDragSensitivity;
            if (this._dragStartPos
                && Math.abs(this._dragStartPos.x - evt.touchPos.x) < sensitivity
                && Math.abs(this._dragStartPos.y - evt.touchPos.y) < sensitivity)
                return;

            this._dragTesting = false;
            if (!this._owner.event(Event.DRAG_START, evt.touchId))
                this.start(evt.touchId);
        }

        if (draggingInst == this._owner) {
            let xx = evt.touchPos.x - _globalDragStart.x + _globalRect.x;
            let yy = evt.touchPos.y - _globalDragStart.y + _globalRect.y;

            let dragBounds = this._owner.dragBounds;
            if (dragBounds) {
                if (xx < dragBounds.x)
                    xx = dragBounds.x;
                else if (xx + _globalRect.width > dragBounds.right) {
                    xx = dragBounds.right - _globalRect.width;
                    if (xx < dragBounds.x)
                        xx = dragBounds.x;
                }

                if (yy < dragBounds.y)
                    yy = dragBounds.y;
                else if (yy + _globalRect.height > dragBounds.bottom) {
                    yy = dragBounds.bottom - _globalRect.height;
                    if (yy < dragBounds.y)
                        yy = dragBounds.y;
                }
            }

            this._owner.parent.globalToLocal(_vec2.setTo(xx, yy));
            this._owner.pos(Math.round(_vec2.x), Math.round(_vec2.y));

            this._owner.event(Event.DRAG_MOVE);
        }
    }

    private _touchEnd(): void {
        if (draggingInst == this._owner) {
            draggingInst = null;
            this._owner.event(Event.DRAG_END);
        }
    }
}
