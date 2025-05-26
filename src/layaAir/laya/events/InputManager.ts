import { ILaya } from "../../ILaya";
import { HideFlags, NodeFlags } from "../Const";
import { Area2D } from "../display/Area2D";
import type { Node } from "../display/Node";
import { Sprite } from "../display/Sprite";
import { Stage } from "../display/Stage";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { PAL } from "../platform/PlatformAdapters";
import { Browser } from "../utils/Browser";
import { Delegate } from "../utils/Delegate";
import { Event, ITouchInfo } from "./Event";

var _isFirstTouch = true;
const _tempPoint = new Point();
const _tempRect = new Rectangle();
const _rollOverChain: Array<Node> = [];
const _rollOutChain: Array<Node> = [];
var _inst: InputManager;

/**
 * @en The `InputManager` class is responsible for managing input events such as mouse, touch, and keyboard events.
 * @zh `InputManager` 类负责管理输入事件，例如鼠标、触摸和键盘事件。
 * @blueprintable
 */
export class InputManager {

    /**
     * @en Whether to enable multi-touch support.
     * @zh 是否开启多点触控支持。
     */
    static multiTouchEnabled: boolean = true;
    /**
     * @en Whether to enable mouse/touch events. Default is true.
     * @zh 是否开启鼠标/触摸事件。默认为 true。
     */
    static mouseEventsEnabled: boolean = true;
    /**
     * @en Whether to enable keyboard events. Default is true.
     * @zh 是否开启键盘事件。默认为 true。
     */
    static keyEventsEnabled: boolean = true;
    /**
     * @en The threshold for considering a mouse press and release as a click. If the distance between the press and release positions exceeds this value, it is not considered a click.
     * @zh 鼠标按下和弹起位置之间的距离阀值，用以判断是否视为一次点击。如果超过这个距离，则不视为点击。
     */
    static clickTestThreshold = 10;

    /**
     * @en The X coordinate of the mouse on the canvas.
     * @zh canvas 上鼠标的 X 坐标。
     */
    static mouseX: number = 0;
    /**
     * @en The Y coordinate of the mouse on the canvas.
     * @zh canvas 上鼠标的 Y 坐标。
     */
    static mouseY: number = 0;

    /**
     * @en The time of the last mouse event.
     * @zh 上一次鼠标事件的时间。
     */
    static lastMouseTime: number = 0;

    /**
     * @en The ID of the last touch event.
     * @zh 上一次触摸事件的ID。
     */
    static lastTouchId: number = 0;

    /**
     * @en Dispatched before the process of a MOUSE_DOWN event, which can be used to preprocess the MOUSE_DOWN event.
     * @zh 在处理MOUSE_DOWN事件之前调度，可用于提前处理按下事件。
     */
    static readonly onMouseDownCapture: Delegate = new Delegate();

    /**@internal */
    protected _stage: Stage;
    /**@internal */
    protected _mouseTouch: TouchInfo;
    /**@internal */
    protected _touches: TouchInfo[];
    /**@internal */
    protected _touchPool: TouchInfo[];
    /**@internal */
    protected _touchTarget: Node;

    /**
     * @en Used for IDE processing.
     * @zh 用于IDE处理。
     */
    protected _eventType: number;
    protected _nativeEvent: MouseEvent | WheelEvent | TouchEvent;

    protected _pressKeys: Set<string | number>;
    protected _keyEvent: Event;

    private _lastTouchTime: number;

    /**
     * @ignore
     */
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

    /**
     * @en Get the touch position.
     * @param touchId The ID of the touch point. If not provided, the position of the first touch point will be returned.
     * @returns The position of the touch point.
     * @zh 获取触摸位置。
     * @param touchId 触摸点ID。如果不提供，将返回第一个触摸点的位置。
     * @returns 触摸点的位置。
     */
    static getTouchPos(touchId?: number): Readonly<Point> {
        if (touchId == null)
            touchId = InputManager.lastTouchId;

        return _inst.getTouch(touchId)?.pos || _inst._mouseTouch.pos;
    }

    /**
     * @en Get the current touch target node.
     * @zh 获取当前触摸目标节点。
     */
    static get touchTarget(): Node {
        return _inst._touchTarget;
    }

    /**
     * @en Get the array of current touch information.
     * @zh 获取当前触摸信息的数组。
     */
    static get touches(): ReadonlyArray<Readonly<ITouchInfo>> {
        return _inst._touches;
    }

    /**
     * @en Get the number of current touches.
     * @zh 获取当前触摸数量。
     */
    static get touchCount(): number {
        return _inst._touches.length;
    }

    /**
     * @en Cancel the click event for a touch point.
     * @param touchId The ID of the touch event to cancel.
     * @zh 取消指定触摸点的点击事件。
     * @param touchId 要取消的触摸事件ID。
     */
    static cancelClick(touchId?: number): void {
        if (touchId == null)
            touchId = InputManager.lastTouchId;
        let touch = _inst.getTouch(touchId);
        if (touch)
            touch.clickCancelled = true;
    }

    /**
     * @en Check if a specific key is pressed.
     * @param key The key value. For more information, see: https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
     * @return Whether the key is pressed.
     * @zh 返回指定键是否被按下。
     * @param key 键值。更多信息请参考：https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
     * @return 是否被按下。
     */
    static hasKeyDown(key: string | number): boolean {
        return _inst._pressKeys.has(key);
    }

    /**
     * @internal
     * @en Initialization.
     * @zh 初始化。
     */
    static __init__(): void {
        let inst = _inst = new InputManager();
        inst._stage = ILaya.stage;
        let canvas = Browser.mainCanvas.source;
        let passiveOption: AddEventListenerOptions = { passive: false };

        canvas.oncontextmenu = () => {
            return false;
        };
        canvas.addEventListener("mousedown", ev => {
            if (!Browser.onIE)
                (ev.cancelable) && (ev.preventDefault());
            inst.handleMouse(ev, 0);
        }, passiveOption);
        canvas.addEventListener("mouseup", ev => {
            (ev.cancelable) && (ev.preventDefault());
            inst.handleMouse(ev, 1);
        }, passiveOption);
        canvas.addEventListener("mousemove", ev => {
            (ev.cancelable) && (ev.preventDefault());
            inst.handleMouse(ev, 2);
        }, passiveOption);
        canvas.addEventListener("mouseout", ev => {
            inst.handleMouse(ev, 3);
        }, passiveOption);
        // canvas.addEventListener("mouseover", ev => {
        // });

        canvas.addEventListener("touchstart", ev => {
            if (!_isFirstTouch && !PAL.textInput.target)
                (ev.cancelable) && (ev.preventDefault());
            inst.handleTouch(ev, 0);
        }, passiveOption);
        canvas.addEventListener("touchend", ev => {
            if (!_isFirstTouch && !PAL.textInput.target)
                (ev.cancelable) && (ev.preventDefault());
            _isFirstTouch = false;
            inst.handleTouch(ev, 1);
        }, passiveOption);
        canvas.addEventListener("touchmove", ev => {
            (ev.cancelable) && (ev.preventDefault());
            inst.handleTouch(ev, 2);
        }, passiveOption);
        canvas.addEventListener("touchcancel", ev => {
            (ev.cancelable) && (ev.preventDefault());
            inst.handleTouch(ev, 3);
        }, passiveOption);

        canvas.addEventListener("wheel", ev => {
            inst.handleMouse(ev, 4);
        }, passiveOption);

        if (typeof (canvas.setPointerCapture) === 'function') {
            canvas.addEventListener("pointerdown", ev => {
                canvas.setPointerCapture(ev.pointerId);
            });
            canvas.addEventListener("pointerup", ev => {
                canvas.releasePointerCapture(ev.pointerId);
            }, true);
        }

        let doc = Browser.document;
        doc.addEventListener("keydown", ev => {
            inst.handleKeys(ev);
        }, true);
        doc.addEventListener("keypress", ev => {
            inst.handleKeys(ev);
        }, true);
        doc.addEventListener("keyup", ev => {
            inst.handleKeys(ev);
        }, true);
    }

    /**
     * @en Handling mouse events
     * @param ev Mouse events
     * @param type Event types
     * @zh 处理鼠标事件
     * @param ev 鼠标事件
     * @param type 事件类型
     */
    handleMouse(ev: MouseEvent | WheelEvent, type: number) {
        this._eventType = type;
        this._nativeEvent = ev;
        InputManager.lastTouchId = 0;
        let now = Browser.now();
        if (this._lastTouchTime != null && now - this._lastTouchTime < 100)
            return;

        //console.log("handleMouse", type);
        let touch: TouchInfo = this._mouseTouch;

        _tempPoint.setTo(ev.pageX || ev.clientX, ev.pageY || ev.clientY);
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
                InputManager.lastMouseTime = now;

                touch.pos.setTo(ix, iy);
                touch.move();

                if (InputManager.mouseEventsEnabled) {
                    touch.bubble(Event.MOUSE_MOVE);

                    for (let t of touch.downTargets) {
                        touch.event._stopped = false;
                        t.event(Event.MOUSE_DRAG, touch.event);
                        if (touch.event._stopped)
                            break;
                    }
                }
            }
        }

        if (touch.lastRollOver != touch.target)
            this.handleRollOver(touch);

        if (type == 0) {
            if (!touch.began) {
                touch.begin();
                this._touches[0] = touch;
                touch.event.button = ev.button;
                touch.downButton = ev.button;

                InputManager.onMouseDownCapture.invoke(touch.touchId);

                if (InputManager.mouseEventsEnabled) {
                    if (ev.button == 0)
                        touch.bubble(Event.MOUSE_DOWN);
                    else
                        touch.bubble(Event.RIGHT_MOUSE_DOWN);
                }
            }
        }
        else if (type == 1) {
            if (touch.began && ev.button == touch.downButton) {
                touch.end();
                this._touches.length = 0;
                touch.event.button = ev.button;

                if (InputManager.mouseEventsEnabled) {
                    if (ev.button == 0)
                        touch.bubble(Event.MOUSE_UP);
                    else
                        touch.bubble(Event.RIGHT_MOUSE_UP);

                    if (touch.moved) {
                        for (let t of touch.downTargets)
                            t.event(Event.MOUSE_DRAG_END, touch.event);
                    }

                    let clickTarget = touch.clickTest();
                    if (clickTarget) {
                        if (ev.button == 0) {
                            touch.event.isDblClick = touch.clickCount == 2;

                            touch.bubble(Event.CLICK, clickTarget);

                            if (touch.clickCount == 2)
                                touch.bubble(Event.DOUBLE_CLICK, clickTarget);

                            touch.event.isDblClick = false;
                        }
                        else {
                            touch.event.isDblClick = touch.clickCount == 2;
                            touch.bubble(Event.RIGHT_CLICK, clickTarget);
                            touch.event.isDblClick = false;
                        }
                    }
                }

                touch.event.button = 0;
            }
        }
        else if (type == 4) {
            if (InputManager.mouseEventsEnabled) {
                touch.event.delta = (<WheelEvent>ev).deltaY * 0.025;
                touch.bubble(Event.MOUSE_WHEEL);
                touch.event.delta = 0;
            }
        }
    }

    /**
     * @en Handling touch screen events.
     * @param ev Touch screen events.
     * @param type Event types.
     * @zh 处理触屏事件
     * @param ev 触屏事件
     * @param type 事件类型
     */
    handleTouch(ev: TouchEvent, type: number) {
        this._eventType = type;
        this._nativeEvent = ev;
        this._lastTouchTime = Browser.now();

        let touches = ev.changedTouches;
        for (let i = 0; i < touches.length; ++i) {
            let uTouch: Touch = touches[i];

            if (!InputManager.multiTouchEnabled
                && this._touches.length > 0
                && this._touches[0].touchId != uTouch.identifier)
                continue;

            _tempPoint.setTo(uTouch.pageX, uTouch.pageY);
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
            InputManager.lastTouchId = touch.touchId;
            if (type == 3 || !InputManager.mouseEventsEnabled)
                touch.target = this._touchTarget = null;
            else {
                touch.target = this._touchTarget = this.getNodeUnderPoint(x, y);
                InputManager.lastMouseTime = this._lastTouchTime;

                let ix = Math.round(x);
                let iy = Math.round(y);

                if (Math.abs(ix - touch.pos.x) > 1.5 || Math.abs(iy - touch.pos.y) > 1.5) {
                    touch.pos.setTo(ix, iy);

                    if (type == 2) {
                        touch.move();

                        if (InputManager.mouseEventsEnabled) {

                            touch.bubble(Event.MOUSE_MOVE);

                            for (let t of touch.downTargets) {
                                touch.event._stopped = false;
                                t.event(Event.MOUSE_DRAG, touch.event);
                                if (touch.event._stopped)
                                    break;
                            }
                        }
                    }
                }
            }

            if (touch.lastRollOver != touch.target)
                this.handleRollOver(touch);

            if (type == 0) {
                if (!touch.began) {
                    touch.begin();

                    InputManager.onMouseDownCapture.invoke(touch.touchId);

                    if (InputManager.mouseEventsEnabled) {
                        touch.bubble(Event.MOUSE_DOWN);
                    }
                }
            }
            else if (type == 1 || type == 3) {
                if (touch.began) {
                    touch.end();

                    if (InputManager.mouseEventsEnabled) {
                        touch.bubble(Event.MOUSE_UP);

                        if (touch.moved) {
                            for (let t of touch.downTargets)
                                t.event(Event.MOUSE_DRAG_END, touch.event);
                        }

                        if (type != 3) {
                            let clickTarget = touch.clickTest();
                            if (clickTarget != null) {
                                touch.event.isDblClick = touch.clickCount == 2;

                                touch.bubble(Event.CLICK, clickTarget);

                                if (touch.clickCount == 2)
                                    touch.bubble(Event.DOUBLE_CLICK, clickTarget);

                                touch.event.isDblClick = false;
                            }
                        }
                    }

                    touch.target = null;
                    this.handleRollOver(touch);
                }

                touch.reset();
                this._touches.splice(this._touches.indexOf(touch), 1);
                this._touchPool.push(touch);
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

    /**
     * @en Handle keys events
     * @param ev Keys events
     * @zh 处理按键事件
     * @param ev 按键事件
     */
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
        this._keyEvent._defaultPrevented = false;

        if (InputManager.keyEventsEnabled) {
            let target = (this._stage.focus && this._stage.focus.displayedInStage) ? this._stage.focus : this._stage;
            let ct = target;
            while (ct) {
                ct.event(type, this._keyEvent.setTo(type, ct, target));
                ct = ct._parent;
            }
        }

        if (this._keyEvent._defaultPrevented)
            ev.preventDefault();

        this._keyEvent.nativeEvent = null;
    }

    /**
     * @en Obtain nodes under location points
     * @param x The x-coordinate value.
     * @param y The y-coordinate value.
     * @returns The node under the point or the stage if no node is found.
     * @zh 获取位置点下的节点
     * @param x x坐标值。
     * @param y y坐标值。
     * @returns 该点下的对象节点，如果没有找到节点则返回舞台。
     */
    getNodeUnderPoint(x: number, y: number): Node {
        let target: Node = this.getSpriteUnderPoint(this._stage, x, y);
        if (!target)
            target = this.getSprite3DUnderPoint(x, y);
        return target || this._stage;
    }

    /**
     * @en Get the sprite under the specified coordinates relative to a Sprite. The x/y values are in the local coordinates of the Sprite.
     * @param sp The Sprite relative to which the coordinates are calculated.
     * @param x The x-coordinate relative to the Sprite.
     * @param y The y-coordinate relative to the Sprite.
     * @returns The sprite under the point or null if not found.
     * @zh 获取在相对Sprite指定坐标下的sprite。x/y值是Sprite的本地坐标。
     * @param sp 相对哪个Sprite计算坐标。
     * @param x 相对于Sprite的X坐标。
     * @param y 相对于Sprite的Y坐标。
     * @returns 该点下的sprite，如果没有找到则返回null。
     */
    getSpriteUnderPoint(sp: Sprite, x: number, y: number): Sprite {
        if (sp._getBit(NodeFlags.AREA_2D)) {
            (<Area2D>sp).transformPoint(x, y, Point.TEMP);
            x = Point.TEMP.x;
            y = Point.TEMP.y;
        }

        //如果有裁剪，则先判断是否在裁剪范围内
        let scrollRect = sp._scrollRect;
        if (scrollRect && !sp._getBit(NodeFlags.DISABLE_INNER_CLIPPING)) {
            _tempRect.setTo(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
            if (!_tempRect.contains(x, y))
                return null;
        }

        let editing = sp._getBit(NodeFlags.EDITING_NODE);

        if (!editing && sp.hitTestPrior && !sp.mouseThrough && sp != this._stage && !this.hitTest(sp, x, y))
            return null;

        for (let i = sp._children.length - 1; i > -1; i--) {
            let child = sp._children[i];
            let childEditing = editing || child._getBit(NodeFlags.EDITING_NODE);
            //只有接受交互事件的，才进行处理
            if (!child._destroyed
                && child._nodeType !== 1
                && (childEditing ? ((!child.hasHideFlag(HideFlags.HideInHierarchy) || child.mouseThrough) && !child._getBit(NodeFlags.HIDE_BY_EDITOR))
                    : (child._mouseState === 2 || child._mouseState === 0 && child._getBit(NodeFlags.CHECK_INPUT)))
                && child._getBit(NodeFlags.ACTUAL_VISIBLE)) {
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

    /**
     * @en Hit test
     * @param sp Relative Sprite.
     * @param x The x-coordinate relative to the Sprite.
     * @param y The y-coordinate relative to the Sprite.
     * @param editing Whether the test is performed in editing mode.
     * @returns True if the point is within the Sprite's bounds, false otherwise.
     * @zh 点击测试
     * @param sp 相对Sprite
     * @param x 相对于Sprite的X坐标。
     * @param y 相对于Sprite的Y坐标。
     * @param editing 是否在编辑模式下进行测试。
     * @returns 如果点在Sprite的范围内返回true，否则返回false。
     */
    hitTest(sp: Sprite, x: number, y: number, editing?: boolean): boolean {
        let isHit: boolean = false;
        if (sp._scrollRect) {
            x -= sp._scrollRect.x;
            y -= sp._scrollRect.y;
        }
        let hitArea = sp._hitArea;
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
                isHit = (hitArea ? hitArea : _tempRect.setTo(0, 0, sp.width, sp.height)).contains(x, y, sp);
            else //如果可穿透，则根据子对象实际大小进行碰撞
                isHit = sp.getGraphicBounds(false, Rectangle.TEMP).contains(x, y);
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
            ele = ele._parent;
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

            ele = ele._parent;
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

/**
 * @en Represents information about a touch event, including its position, state, and related nodes.
 * @zh 表示触摸事件的信息，包括其位置、状态和相关节点。
 */
class TouchInfo implements ITouchInfo {
    /**
     * @en The event object associated with this touch.
     * @zh 与此触摸关联的事件对象。
     */
    readonly event: Event;
    /**
     * @en The current position of the touch.
     * @zh 当前触摸的位置。
     */
    readonly pos: Point;
    /**
     * @en The ID of the touch.
     * @zh 触摸的ID。
     */
    touchId: number;
    /**
     * @en The number of consecutive clicks.
     * @zh 连续点击的次数。
     */
    clickCount: number;
    /**
     * @en Indicates whether the touch has begun.
     * @zh 表示触摸是否已开始。
     */
    began: boolean;
    /**
     * @en The target node of the touch.
     * @zh 触摸的目标节点。
     */
    target: Node;
    /**
     * @en The last node the touch rolled over.
     * @zh 最后一次触摸经过的节点。
     */
    lastRollOver: Node;
    /**
     * @en Indicates whether the click was cancelled.
     * @zh 表示点击是否已取消。
     */
    clickCancelled: boolean;
    /**
     * @en Indicates whether the touch has moved.
     * @zh 表示触摸是否已移动。
     */
    moved: boolean;
    /**
     * @en The button pressed during the touch.
     * @zh 触摸期间按下的按钮。
     */
    downButton: number;
    /**
     * @en The list of nodes that were under the touch when it began.
     * @zh 触摸开始时位于其下方的节点列表。
     */
    readonly downTargets: Node[];
    /**
     * @en The position where the touch began.
     * @zh 触摸开始时的位置。
     */
    private downPos: Point;

    private bubbleChain: Array<Node>;

    /** 
     * @ignore
     * @en Creates a new instance of the TouchInfo class.
     * @param touches An array of touch information.
     * @zh 创建 TouchInfo 类的新实例。
     * @param touches 触摸信息数组。
     */
    constructor(touches: Array<TouchInfo>) {
        this.downPos = new Point();
        this.downTargets = [];
        this.bubbleChain = [];
        this.event = new Event();
        this.event._touches = touches;
        this.pos = this.event.touchPos;
        this.touchId = 0;
        this.reset();
    }

    /**
     * @en Marks the beginning of the touch.
     * @zh 标记触摸的开始。
     */
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
                ele = ele._parent;
            }
        }
    }

    /**
     * @en Updates the touch information when the touch moves.
     * @zh 当触摸移动时更新触摸信息。
     */
    move() {
        this.moved = true;

        let ox = Math.abs(this.pos.x - this.downPos.x) * ILaya.stage._canvasTransform.getScaleX();
        let oy = Math.abs(this.pos.y - this.downPos.y) * ILaya.stage._canvasTransform.getScaleY();

        if (ox > InputManager.clickTestThreshold || oy > InputManager.clickTestThreshold)
            this.clickCancelled = true;
    }

    /**
     * @en Marks the end of the touch and updates the click count.
     * @zh 标记触摸的结束并更新点击次数。
     */
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

    /**
     * @en Tests whether the touch should trigger a click event and returns the target node if successful.
     * @returns The target node if the click test is successful; otherwise, null.
     * @zh 测试触摸是否应触发点击事件，并在成功时返回目标节点。
     * @returns 如果点击测试成功，则返回目标节点；否则返回null。
     */
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

            obj = obj._parent;
        }

        this.downTargets.length = 0;

        return obj;
    }

    /**
     * @en Resets the touch information to its initial state.
     * @zh 将触摸信息重置为初始状态。
     */
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
        this.downButton = 0;
    }

    bubble(type: string, target?: Node) {
        let arr: Array<Node> = this.bubbleChain;
        arr.length = 0;

        target = target || this.target || ILaya.stage;

        let obj: Node = target;
        while (obj) {
            if (obj.activeInHierarchy)
                arr.push(obj);
            obj = obj._parent;
        }

        let evt: Event = this.event;
        evt._stopped = false;

        for (let obj of arr) {
            evt.setTo(type, obj, target);
            obj.event(type, evt);
            if (evt._stopped) {
                if (type === Event.MOUSE_DOWN || type === Event.RIGHT_MOUSE_DOWN) {
                    let i = this.downTargets.indexOf(obj);
                    if (i != -1)
                        this.downTargets.splice(i + 1, this.downTargets.length - i - 1);
                }
                break;
            }
        }

        if (type === Event.MOUSE_UP || type === Event.RIGHT_MOUSE_UP) {
            for (let obj of this.downTargets) {
                if (obj && arr.indexOf(obj) == -1) {
                    evt.setTo(type, obj, target);
                    obj.event(type, evt);
                    if (evt && evt._stopped)
                        break;
                }
            }
        }
    }
}
