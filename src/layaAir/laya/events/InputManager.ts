import { HideFlags, NodeFlags } from "../Const";
import { Node } from "../display/Node";
import { Sprite } from "../display/Sprite";
import { Stage } from "../display/Stage";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Browser } from "../utils/Browser";
import { Event, ITouchInfo } from "./Event";

var _isFirstTouch = true;
const _tempPoint = new Point();
const _tempRect = new Rectangle();
const _rollOverChain: Array<Node> = [];
const _rollOutChain: Array<Node> = [];
var _inst: InputManager;

export class InputManager {

    /**是否开启多点触控*/
    static multiTouchEnabled: boolean = true;
    /**是否开启鼠标/触摸事件，默认为true*/
    static mouseEventsEnabled: boolean = true;
    /**是否开启键盘事件，默认为true*/
    static keyEventsEnabled: boolean = true;
    /**如果鼠标按下的位置和弹起的位置距离超过这个阀值，则不视为一次点击*/
    static clickTestThreshold = 10;

    /** canvas 上的鼠标X坐标。*/
    static mouseX: number = 0;
    /** canvas 上的鼠标Y坐标。*/
    static mouseY: number = 0;
    /** 当前是否正在输入文字 */
    static isTextInputting = false;
    static isiOSWKwebView: boolean = false;
    protected _stage: Stage;
    protected _mouseTouch: TouchInfo;
    protected _touches: TouchInfo[];
    protected _touchPool: TouchInfo[];
    protected _touchTarget: Node;

    //用于IDE处理
    protected _eventType: number;
    protected _nativeEvent: MouseEvent | WheelEvent | TouchEvent;

    protected _pressKeys: Set<string | number>;
    protected _keyEvent: Event;

    private _touchInput: boolean;

    constructor() {
        this._touches = [];
        this._touchPool = [];
        this._mouseTouch = new TouchInfo(this._touches);
        this._pressKeys = new Set();
        this._keyEvent = new Event();
        this._keyEvent._touches = this._touches;
    }

    static get inst() {
        return _inst;
    }

    static getTouchPos(touchId?: number): Readonly<Point> {
        if (touchId == null)
            return _inst._touches[0]?.pos || Point.EMPTY;
        else
            return _inst.getTouch(touchId)?.pos || Point.EMPTY;
    }

    static get touchTarget(): Node {
        return _inst._touchTarget;
    }

    static get touches(): ReadonlyArray<Readonly<ITouchInfo>> {
        return _inst._touches;
    }

    static get touchCount(): number {
        return _inst._touches.length;
    }

    static cancelClick(touchId?: number): void {
        let touch = touchId == null ? _inst._touches[0] : _inst.getTouch(touchId);
        if (touch)
            touch.clickCancelled = true;
    }

    /**
     * 返回指定键是否被按下。
     * @param	key 键值。参考：https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
     * @return 是否被按下。
     */
    static hasKeyDown(key: string | number): boolean {
        return _inst._pressKeys.has(key);
    }

    /**
     * @private
     * 初始化。
     */
    static __init__(stage: Stage, canvas: HTMLCanvasElement): void {
        let inst = _inst = new InputManager();
        inst._stage = stage;

        canvas.oncontextmenu = () => {
            return false;
        };
        canvas.addEventListener("mousedown", ev => {
            if (!Browser.onIE)
                (ev.cancelable) && (ev.preventDefault());
            if (!inst._touchInput)
                inst.handleMouse(ev, 0);
        }, { passive: false });
        canvas.addEventListener("mouseup", ev => {
            (ev.cancelable) && (ev.preventDefault());
            if (!inst._touchInput)
                inst.handleMouse(ev, 1);
        }, { passive: false });
        canvas.addEventListener("mousemove", ev => {
            (ev.cancelable) && (ev.preventDefault());
            if (!inst._touchInput)
                inst.handleMouse(ev, 2);
        }, { passive: false });
        canvas.addEventListener("mouseout", ev => {
            if (!inst._touchInput)
                inst.handleMouse(ev, 3);
        }, { passive: false });
        // canvas.addEventListener("mouseover", ev => {
        // });

        canvas.addEventListener("touchstart", ev => {
            inst._touchInput = true;
            if (!_isFirstTouch && !InputManager.isTextInputting)
                (ev.cancelable) && (ev.preventDefault());
            inst.handleTouch(ev, 0);
        }, { passive: false });
        canvas.addEventListener("touchend", ev => {
            if (!_isFirstTouch && !InputManager.isTextInputting)
                (ev.cancelable) && (ev.preventDefault());
            _isFirstTouch = false;
            inst.handleTouch(ev, 1);
        }, { passive: false });
        canvas.addEventListener("touchmove", ev => {
            (ev.cancelable) && (ev.preventDefault());
            inst.handleTouch(ev, 2);
        }, { passive: false });
        canvas.addEventListener("touchcancel", ev => {
            (ev.cancelable) && (ev.preventDefault());
            inst.handleTouch(ev, 3);
        }, { passive: false });

        canvas.addEventListener("wheel", ev => {
            inst.handleMouse(ev, 4);
        }, { passive: false });

        canvas.addEventListener("pointerdown", ev => {
            canvas.setPointerCapture(ev.pointerId);
        });
        canvas.addEventListener("pointerup", ev => {
            canvas.releasePointerCapture(ev.pointerId);
        }, true);

        let document = <Document>Browser.document;
        document.addEventListener("keydown", ev => {
            inst.handleKeys(ev);
        }, true);
        document.addEventListener("keypress", ev => {
            inst.handleKeys(ev);
        }, true);
        document.addEventListener("keyup", ev => {
            inst.handleKeys(ev);
        }, true);
    }

    handleMouse(ev: MouseEvent | WheelEvent, type: number) {
        this._eventType = type;
        this._nativeEvent = ev;

        //console.log("handleMouse", type);
        let touch: TouchInfo = this._mouseTouch;

        _tempPoint.setTo(ev.pageX || ev.clientX, ev.pageY || ev.clientY);
        if (this._stage._canvasTransform)
            this._stage._canvasTransform.invertTransformPoint(_tempPoint);
        InputManager.mouseX = _tempPoint.x;
        InputManager.mouseY = _tempPoint.y;
        let x = _tempPoint.x / this._stage.clientScaleX;
        let y = _tempPoint.y / this._stage.clientScaleY;

        touch.event.nativeEvent = ev;
        if (type == 3 || !InputManager.mouseEventsEnabled)
            touch.target = this._touchTarget = null;
        else {
            touch.target = this._touchTarget = this.getNodeUnderPoint(x, y);

            let ix = Math.round(x);
            let iy = Math.round(y);

            if (ix != touch.pos.x || iy != touch.pos.y) {
                this._stage._mouseMoveTime = Browser.now();

                touch.pos.setTo(ix, iy);
                touch.move();

                if (InputManager.mouseEventsEnabled) {
                    touch.target.bubbleEvent(Event.MOUSE_MOVE, touch.event);

                    for (let t of touch.downTargets)
                        t.event(Event.MOUSE_DRAG, touch.event);
                }
            }
        }

        if (touch.lastRollOver != touch.target)
            this.handleRollOver(touch);

        if (type == 0) {
            if (!touch.began) {
                touch.begin();
                this._touches[0] = touch;

                if (InputManager.mouseEventsEnabled) {
                    this.handleFocus();

                    if (ev.button == 0)
                        touch.target?.bubbleEvent(Event.MOUSE_DOWN, touch.event);
                    else
                        touch.target?.bubbleEvent(Event.RIGHT_MOUSE_DOWN, touch.event);
                }
            }
        }
        else if (type == 1) {
            if (touch.began) {
                touch.end();
                this._touches.length = 0;

                if (InputManager.mouseEventsEnabled) {
                    if (ev.button == 0)
                        touch.target?.bubbleEvent(Event.MOUSE_UP, touch.event);
                    else
                        touch.target?.bubbleEvent(Event.RIGHT_MOUSE_UP, touch.event);

                    if (touch.moved) {
                        for (let t of touch.downTargets)
                            t.event(Event.MOUSE_DRAG_END, touch.event);
                    }

                    let clickTarget = touch.clickTest();
                    if (clickTarget) {
                        if (ev.button == 0) {
                            touch.event.isDblClick = touch.clickCount == 2;

                            clickTarget.bubbleEvent(Event.CLICK, touch.event);

                            if (touch.clickCount == 2)
                                clickTarget.bubbleEvent(Event.DOUBLE_CLICK, touch.event);

                            touch.event.isDblClick = false;
                        }
                        else {
                            touch.event.isDblClick = touch.clickCount == 2;
                            clickTarget.bubbleEvent(Event.RIGHT_CLICK, touch.event);
                            touch.event.isDblClick = false;
                        }
                    }
                }
            }
        }
        else if (type == 4) {
            if (InputManager.mouseEventsEnabled) {
                touch.event.delta = (<WheelEvent>ev).deltaY * 0.025;
                touch.target?.bubbleEvent(Event.MOUSE_WHEEL, touch.event);
                touch.event.delta = 0;
            }
        }
    }

    handleTouch(ev: TouchEvent, type: number) {
        this._eventType = type;
        this._nativeEvent = ev;

        let touches = ev.changedTouches;
        for (let i = 0; i < touches.length; ++i) {
            let uTouch: Touch = touches[i];

            if (!InputManager.multiTouchEnabled
                && this._touches.length > 0
                && this._touches[0].touchId != uTouch.identifier)
                continue;

            _tempPoint.setTo(uTouch.pageX, uTouch.pageY);
            if (this._stage._canvasTransform)
                this._stage._canvasTransform.invertTransformPoint(_tempPoint);
            InputManager.mouseX = _tempPoint.x;
            InputManager.mouseY = _tempPoint.y;
            let x = _tempPoint.x / this._stage.clientScaleX;
            let y = _tempPoint.y / this._stage.clientScaleY;

            let touch = this.getTouch(uTouch.identifier, type == 0);
            if (!touch)
                continue;

            touch.event.nativeEvent = ev;
            touch.event.touchId = touch.touchId;
            if (type == 3 || !InputManager.mouseEventsEnabled)
                touch.target = this._touchTarget = null;
            else {
                touch.target = this._touchTarget = this.getNodeUnderPoint(x, y);
                this._stage._mouseMoveTime = Browser.now();

                let ix = Math.round(x);
                let iy = Math.round(y);

                if (Math.abs(ix - touch.pos.x) > 1.5 || Math.abs(iy - touch.pos.y) > 1.5) {
                    touch.pos.setTo(ix, iy);

                    if (type == 2) {
                        touch.move();

                        if (InputManager.mouseEventsEnabled) {

                            touch.target.bubbleEvent(Event.MOUSE_MOVE, touch.event);

                            for (let t of touch.downTargets)
                                t.event(Event.MOUSE_DRAG, touch.event);
                        }
                    }
                }
            }

            if (touch.lastRollOver != touch.target)
                this.handleRollOver(touch);

            if (type == 0) {
                if (!touch.began) {
                    touch.begin();

                    if (InputManager.mouseEventsEnabled) {
                        this.handleFocus();
                        touch.target?.bubbleEvent(Event.MOUSE_DOWN, touch.event);
                    }
                }
            }
            else if (type == 1 || type == 3) {
                if (touch.began) {
                    touch.end();

                    if (InputManager.mouseEventsEnabled) {
                        touch.target?.bubbleEvent(Event.MOUSE_UP, touch.event);

                        if (touch.moved) {
                            for (let t of touch.downTargets)
                                t.event(Event.MOUSE_DRAG_END, touch.event);
                        }

                        if (type != 3) {
                            let clickTarget = touch.clickTest();
                            if (clickTarget != null) {
                                touch.event.isDblClick = touch.clickCount == 2;

                                clickTarget.bubbleEvent(Event.CLICK, touch.event);

                                if (touch.clickCount == 2)
                                    clickTarget.bubbleEvent(Event.DOUBLE_CLICK, touch.event);

                                touch.event.isDblClick = false;
                            }
                        }
                    }

                    touch.target = null;
                    this.handleRollOver(touch);

                    touch.reset();
                    this._touches.splice(this._touches.indexOf(touch), 1);
                    this._touchPool.push(touch);
                }
            }
        }
    }

    private getTouch(touchId: number, shouldCreate?: boolean): TouchInfo {
        let touch = this._touches.find(e => e.touchId == touchId);
        if (touch || !shouldCreate)
            return touch;

        touch = this._touchPool.length > 0 ? this._touchPool.pop() : new TouchInfo(this._touches);
        touch.touchId = touchId;
        this._touches.push(touch);

        return touch;
    }

    private handleFocus() {
        if (InputManager.isTextInputting
            && this._stage.focus && (<any>this._stage.focus)["focus"]
            && !this._stage.focus.contains(this._touchTarget)) {
            // 从UI Input组件中取得Input引用
            // _tf 是TextInput的属性
            let pre_input: any = (<any>this._stage.focus)['_tf'] || this._stage.focus;
            let new_input = (<any>this._touchTarget)['_tf'] || this._touchTarget;

            // 新的焦点是Input的情况下，不需要blur；
            // 不过如果是Input和TextArea之间的切换，还是需要重新弹出输入法；
            if (new_input.nativeInput && new_input.multiline == pre_input.multiline)
                pre_input['_focusOut']();
            else
                pre_input.focus = false;
        }
    }

    handleKeys(ev: KeyboardEvent): void {
        let type = ev.type;
        let keyCode = ev.keyCode;
        //判断同时按下的键
        if (type === "keydown") {
            if (keyCode != 0)
                this._pressKeys.add(keyCode);
            this._pressKeys.add(ev.key);
        }
        else if (type === "keyup") {
            if (keyCode != 0)
                this._pressKeys.delete(keyCode);
            this._pressKeys.delete(ev.key);
        }

        this._keyEvent.nativeEvent = ev;

        if (InputManager.keyEventsEnabled) {
            let target = (this._stage.focus && (this._stage.focus.event != null) && this._stage.focus.displayedInStage) ? this._stage.focus : this._stage;
            let ct = target;
            while (ct) {
                ct.event(type, this._keyEvent.setTo(type, ct, target));
                ct = ct.parent;
            }
        }

        this._keyEvent.nativeEvent = null;
    }

    getNodeUnderPoint(x: number, y: number): Node {
        let target: Node = this.getSpriteUnderPoint(this._stage, x, y);
        if (!target)
            target = this.getSprite3DUnderPoint(x, y);
        return target || this._stage;
    }

    /**
     * 获取指定坐标下的sprite。x/y值是sp的本地坐标
     * @param sp
     * @param x
     * @param y
     */
    getSpriteUnderPoint(sp: Sprite, x: number, y: number): Sprite {
        //如果有裁剪，则先判断是否在裁剪范围内
        let scrollRect = sp._style.scrollRect;
        if (scrollRect && !sp._getBit(NodeFlags.DISABLE_INNER_CLIPPING)) {
            _tempRect.setTo(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
            if (!_tempRect.contains(x, y))
                return null;
        }

        let editing = sp._getBit(NodeFlags.EDITING_NODE);

        if (!editing && sp.hitTestPrior && !sp.mouseThrough && sp != this._stage && !this.hitTest(sp, x, y))
            return null;

        for (let i = sp._children.length - 1; i > -1; i--) {
            let child = <Sprite>sp._children[i];
            let childEditing = editing || child._getBit(NodeFlags.EDITING_NODE);
            //只有接受交互事件的，才进行处理
            if (!child._destroyed
                && (childEditing ? ((!child.hasHideFlag(HideFlags.HideInHierarchy) || child.mouseThrough) && !child._getBit(NodeFlags.HIDE_BY_EDITOR)) : child._mouseState > 1)
                && (child._visible || child._getBit(NodeFlags.DISABLE_VISIBILITY))) {
                _tempPoint.setTo(x, y);
                child.fromParentPoint(_tempPoint);
                let ret = this.getSpriteUnderPoint(child, _tempPoint.x, _tempPoint.y);
                if (ret)
                    return ret;
            }
        }

        if (editing) {
            if (!sp._getBit(NodeFlags.LOCK_BY_EDITOR)
                && !sp.hasHideFlag(HideFlags.HideInHierarchy)
                && this.hitTest(sp, x, y, editing))
                return sp;
        }
        else if (sp != this._stage) {
            if (sp.hitTestPrior && !sp.mouseThrough || this.hitTest(sp, x, y))
                return sp;
        }

        return null;
    }

    getSprite3DUnderPoint(x: number, y: number): Node {
        return null;
    }

    hitTest(sp: Sprite, x: number, y: number, editing?: boolean): boolean {
        let isHit: boolean = false;
        if (sp.scrollRect) {
            x -= sp._style.scrollRect.x;
            y -= sp._style.scrollRect.y;
        }
        let hitArea = sp._style.hitArea;
        let mouseThrough = sp.mouseThrough;
        if (editing) {
            hitArea = null;
            mouseThrough = false;
        }

        if (hitArea) {
            return hitArea.contains(x, y, sp);
        }

        if (sp.width > 0 && sp.height > 0 || mouseThrough || hitArea) {
            //判断是否在矩形区域内
            if (!mouseThrough)
                isHit = (hitArea ? hitArea : _tempRect.setTo(0, 0, sp.width, sp.height)).contains(x, y);
            else //如果可穿透，则根据子对象实际大小进行碰撞
                isHit = sp.getGraphicBounds().contains(x, y);
        }
        return isHit;
    }

    private handleRollOver(touch: TouchInfo) {
        if (!InputManager.mouseEventsEnabled) {
            touch.lastRollOver = touch.target;
            return;
        }

        _rollOverChain.length = 0;
        _rollOutChain.length = 0;

        let ele = touch.lastRollOver;
        while (ele) {
            _rollOutChain.push(ele);
            ele = ele.parent;
        }
        touch.lastRollOver = touch.target;

        ele = touch.target;
        while (ele) {
            let i = _rollOutChain.indexOf(ele);
            if (i != -1) {
                _rollOutChain.splice(i, _rollOutChain.length - i);
                break;
            }

            _rollOverChain.push(ele);

            ele = ele.parent;
        }

        let cnt = _rollOutChain.length;
        if (cnt > 0) {
            for (let i = 0; i < cnt; i++) {
                ele = _rollOutChain[i];
                if (!ele._destroyed)
                    ele.event(Event.MOUSE_OUT, touch.event.setTo(Event.MOUSE_OUT, ele, ele));
            }
            _rollOutChain.length = 0;
        }

        cnt = _rollOverChain.length;
        if (cnt > 0) {
            for (let i = 0; i < cnt; i++) {
                ele = _rollOverChain[i];
                if (ele.activeInHierarchy)
                    ele.event(Event.MOUSE_OVER, touch.event.setTo(Event.MOUSE_OVER, ele, ele));
            }
            _rollOverChain.length = 0;
        };
    }
}

const clickTrack: Record<number, { pos: Point, time: number, button: number }> = {};

class TouchInfo implements ITouchInfo {
    readonly event: Event;
    readonly pos: Point;
    touchId: number;
    clickCount: number;
    began: boolean;
    target: Node;
    lastRollOver: Node;
    clickCancelled: boolean;
    moved: boolean;
    readonly downTargets: Node[];

    private downPos: Point;

    constructor(touches: Array<TouchInfo>) {
        this.downPos = new Point();
        this.downTargets = [];
        this.event = new Event();
        this.event._touches = touches;
        this.pos = this.event.touchPos;
        this.reset();
    }

    begin() {
        this.began = true;
        this.clickCancelled = false;
        this.moved = false;
        this.downPos.copy(this.pos);

        this.downTargets.length = 0;
        if (this.target) {
            let ele = this.target;
            while (ele) {
                this.downTargets.push(ele);
                ele = ele.parent;
            }
        }
    }

    move() {
        this.moved = true;

        if (Math.abs(this.pos.x - this.downPos.x) > InputManager.clickTestThreshold
            || Math.abs(this.pos.y - this.downPos.y) > InputManager.clickTestThreshold)
            this.clickCancelled = true;
    }

    end() {
        this.began = false;
        let now = performance.now();

        let lastClick = clickTrack[this.touchId];
        if (!lastClick) {
            lastClick = { pos: new Point(), time: 0, button: 0 };
            clickTrack[this.touchId] = lastClick;
        }

        if (this.downTargets.length == 0
            || this.clickCancelled
            || Math.abs(this.pos.x - this.downPos.x) > InputManager.clickTestThreshold
            || Math.abs(this.pos.y - this.downPos.y) > InputManager.clickTestThreshold) {
            this.clickCancelled = true;
            lastClick.time = 0;
            this.clickCount = 1;
        }
        else {
            if (now - lastClick.time < 350
                && Math.abs(this.pos.x - lastClick.pos.x) < InputManager.clickTestThreshold
                && Math.abs(this.pos.y - lastClick.pos.y) < InputManager.clickTestThreshold
                && lastClick.button == this.event.button) {
                this.clickCount = 2;
            }
            else
                this.clickCount = 1;
            lastClick.time = now;
            lastClick.pos.copy(this.pos);
            lastClick.button = this.event.button;
        }
    }

    clickTest(): Node {
        if (this.clickCancelled) {
            this.downTargets.length = 0;
            return null;
        }

        let obj = this.downTargets[0];
        if (obj.activeInHierarchy) {
            this.downTargets.length = 0;
            return obj;
        }

        obj = this.target;
        while (obj) {
            let i = this.downTargets.indexOf(obj);
            if (i != -1 && obj.activeInHierarchy)
                break;

            obj = obj.parent;
        }

        this.downTargets.length = 0;

        return obj;
    }

    reset() {
        this.pos.setTo(0, 0);
        this.touchId = 0;
        this.clickCount = 0;
        this.began = false;
        this.moved = false;
        this.target = null;
        this.downTargets.length = 0;
        this.lastRollOver = null;
        this.clickCancelled = false;
    }
}
