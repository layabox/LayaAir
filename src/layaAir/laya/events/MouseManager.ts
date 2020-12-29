import { Event } from "./Event";
import { TouchManager } from "./TouchManager";
import { Input } from "../display/Input"
import { Sprite } from "../display/Sprite"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { Browser } from "../utils/Browser"
import { Stage } from "../display/Stage";
import { ILaya } from "../../ILaya";


/**
 * <p><code>MouseManager</code> 是鼠标、触摸交互管理器。</p>
 * <p>鼠标事件流包括捕获阶段、目标阶段、冒泡阶段。<br/>
 * 捕获阶段：此阶段引擎会从stage开始递归检测stage及其子对象，直到找到命中的目标对象或者未命中任何对象；<br/>
 * 目标阶段：找到命中的目标对象；<br/>
 * 冒泡阶段：事件离开目标对象，按节点层级向上逐层通知，直到到达舞台的过程。</p>
 */
export class MouseManager {
    /**
     * MouseManager 单例引用。
     */
    static instance: MouseManager = new MouseManager();

    /**是否开启鼠标检测，默认为true*/
    static enabled: boolean = true;
    /**是否开启多点触控*/
    static multiTouchEnabled: boolean = true;
    /** canvas 上的鼠标X坐标。*/
    mouseX: number = 0;
    /** canvas 上的鼠标Y坐标。*/
    mouseY: number = 0;
    /** 是否禁用除 stage 以外的鼠标事件检测。*/
    disableMouseEvent: boolean = false;
    /** 鼠标按下的时间。单位为毫秒。*/
    mouseDownTime: number = 0;
    /** 鼠标移动精度。*/
    mouseMoveAccuracy: number = 2;
    /** @private */
    private static _isTouchRespond: boolean;
    /** @internal */
    _event: Event = new Event();
    private _stage: Stage;

    /** @private 希望capture鼠标事件的对象。*/
    private _captureSp: Sprite = null;
    /** @private 现在不支持直接把绝对坐标转到本地坐标，只能一级一级做下去，因此记录一下这个链*/
    private _captureChain: Sprite[] = [];
    /** @private capture对象独占消息 */
    private _captureExlusiveMode: boolean = false;
    /** @private 在发送事件的过程中，是否发送给了_captureSp */
    private _hitCaputreSp: boolean = false;

    private _point: Point = new Point();
    private _rect: Rectangle = new Rectangle();
    private _target: any;
    private _lastMoveTimer: number = 0;
    private _isLeftMouse: boolean;
    private _prePoint: Point = new Point();
    private _touchIDs: any = {};
    private _curTouchID: number = NaN;
    private _id: number = 1;
    private static _isFirstTouch: boolean = true;
    /**
     * @private
     * 初始化。
     */
    __init__(stage: Stage, canvas: any): void {
        this._stage = stage;
        var _this: MouseManager = this;
        //var canvas:* = Render.canvas;

        canvas.oncontextmenu = function (e: any): any {
            if (MouseManager.enabled) return false;
        }
        canvas.addEventListener('mousedown', function (e: any): void {
            if (MouseManager.enabled) {
                if (!Browser.onIE)
                    (e.cancelable) && (e.preventDefault());
                _this.mouseDownTime = Browser.now();
                _this.runEvent(e);
            }
        });
        canvas.addEventListener('mouseup', function (e: any): void {
            if (MouseManager.enabled) {
                (e.cancelable) && (e.preventDefault());
                _this.mouseDownTime = -Browser.now();
                _this.runEvent(e);
            }
        }, true);
        canvas.addEventListener('mousemove', function (e: any): void {
            if (MouseManager.enabled) {
                (e.cancelable) && (e.preventDefault());
                var now: number = Browser.now();
                if (now - _this._lastMoveTimer < 10) return;
                _this._lastMoveTimer = now;
                _this.runEvent(e);
            }
        }, true);
        canvas.addEventListener("mouseout", function (e: any): void {
            if (MouseManager.enabled) _this.runEvent(e);
        })
        canvas.addEventListener("mouseover", function (e: any): void {
            if (MouseManager.enabled) _this.runEvent(e);
        })
        canvas.addEventListener("touchstart", function (e: any): void {
            if (MouseManager.enabled) {
                if (!MouseManager._isFirstTouch && !Input.isInputting)
                    (e.cancelable) && (e.preventDefault());
                _this.mouseDownTime = Browser.now();
                _this.runEvent(e);
            }
        });
        canvas.addEventListener("touchend", function (e: any): void {
            if (MouseManager.enabled) {
                if (!MouseManager._isFirstTouch && !Input.isInputting)
                    (e.cancelable) && (e.preventDefault());
                MouseManager._isFirstTouch = false;
                _this.mouseDownTime = -Browser.now();
                _this.runEvent(e);
            } else {
                _this._curTouchID = NaN;
            }
        }, true);
        canvas.addEventListener("touchmove", function (e: any): void {
            if (MouseManager.enabled) {
                (e.cancelable) && (e.preventDefault());
                _this.runEvent(e);
            }
        }, true);
        canvas.addEventListener("touchcancel", function (e: any): void {
            if (MouseManager.enabled) {
                (e.cancelable) && (e.preventDefault());
                _this.runEvent(e);
            } else {
                _this._curTouchID = NaN;
            }
        }, true);
        canvas.addEventListener('mousewheel', function (e: any): void {
            if (MouseManager.enabled) _this.runEvent(e);
        });
        canvas.addEventListener('DOMMouseScroll', function (e: any): void {
            if (MouseManager.enabled) _this.runEvent(e);
        });
    }
    private _tTouchID: number;

    private initEvent(e: any, nativeEvent: any = null): void {
        var _this: MouseManager = this;

        _this._event._stoped = false;
        _this._event.nativeEvent = nativeEvent || e;
        _this._target = null;

        this._point.setTo(e.pageX || e.clientX, e.pageY || e.clientY);
        if (this._stage._canvasTransform) {
            this._stage._canvasTransform.invertTransformPoint(this._point);
            _this.mouseX = this._point.x;
            _this.mouseY = this._point.y;
        }

        _this._event.touchId = e.identifier || 0;
        this._tTouchID = _this._event.touchId;

        var evt: Event;
        evt = TouchManager.I._event;
        evt._stoped = false;
        evt.nativeEvent = _this._event.nativeEvent;
        evt.touchId = _this._event.touchId;
    }

    private checkMouseWheel(e: any): void {
        this._event.delta = e.wheelDelta ? e.wheelDelta * 0.025 : -e.detail;
        var _lastOvers: any[] = TouchManager.I.getLastOvers();

        for (var i: number = 0, n: number = _lastOvers.length; i < n; i++) {
            var ele: any = _lastOvers[i];
            ele.event(Event.MOUSE_WHEEL, this._event.setTo(Event.MOUSE_WHEEL, ele, this._target));
        }
        //			_stage.event(Event.MOUSE_WHEEL, _event.setTo(Event.MOUSE_WHEEL, _stage, _target));
    }

    private onMouseMove(ele: any): void {

        TouchManager.I.onMouseMove(ele, this._tTouchID);

    }

    private onMouseDown(ele: any): void {
        if (Input.isInputting && ILaya.stage.focus && (ILaya.stage.focus as any)["focus"] && !ILaya.stage.focus.contains(this._target)) {
            // 从UI Input组件中取得Input引用
            // _tf 是TextInput的属性
            var pre_input: any = (ILaya.stage.focus as any)['_tf'] || ILaya.stage.focus;
            var new_input: Input = ele['_tf'] || ele;

            // 新的焦点是Input的情况下，不需要blur；
            // 不过如果是Input和TextArea之间的切换，还是需要重新弹出输入法；
            if (new_input instanceof Input && new_input.multiline == pre_input.multiline)
                pre_input['_focusOut']();
            else
                pre_input.focus = false;
        }
        TouchManager.I.onMouseDown(ele, this._tTouchID, this._isLeftMouse);
    }

    private onMouseUp(ele: any): void {
        TouchManager.I.onMouseUp(ele, this._tTouchID, this._isLeftMouse);
    }

    private check(sp: Sprite, mouseX: number, mouseY: number, callBack: Function): boolean {
        this._point.setTo(mouseX, mouseY);
        sp.fromParentPoint(this._point);
        mouseX = this._point.x;
        mouseY = this._point.y;

        //如果有裁剪，则先判断是否在裁剪范围内
        var scrollRect: Rectangle = sp._style.scrollRect;
        if (scrollRect) {
            this._rect.setTo(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
            if (!this._rect.contains(mouseX, mouseY)) return false;
        }

        //先判定子对象是否命中
        if (!this.disableMouseEvent) {
            //优先判断父对象
            //默认情况下，hitTestPrior=mouseThrough=false，也就是优先check子对象
            //$NEXTBIG:下个重大版本将sp.mouseThrough从此逻辑中去除，从而使得sp.mouseThrough只负责目标对象的穿透
            if (sp.hitTestPrior && !sp.mouseThrough && !this.hitTest(sp, mouseX, mouseY)) {
                return false;
            }
            for (var i: number = sp._children.length - 1; i > -1; i--) {
                var child: Sprite = sp._children[i];
                //只有接受交互事件的，才进行处理
                if (!child.destroyed && child._mouseState > 1 && child._visible) {
                    if (this.check(child, mouseX, mouseY, callBack)) return true;
                }
            }
            // 检查逻辑子对象
            for (i = sp._extUIChild.length - 1; i >= 0; i--) {
                var c: Sprite = sp._extUIChild[i];
                if (!c.destroyed && c._mouseState > 1 && c._visible) {
                    if (this.check(c, mouseX, mouseY, callBack)) return true;
                }
            }
        }

        //避免重复进行碰撞检测，考虑了判断条件的命中率。
        var isHit: boolean = (sp.hitTestPrior && !sp.mouseThrough && !this.disableMouseEvent) ? true : this.hitTest(sp, mouseX, mouseY);

        if (isHit) {
            this._target = sp;
            callBack.call(this, sp);
            if (this._target == this._hitCaputreSp) {
                this._hitCaputreSp = true;
            }
        } else if (callBack === this.onMouseUp && sp === this._stage) {
            //如果stage外mouseUP
            this._target = this._stage;
            callBack.call(this, this._target);
        }

        return isHit;
    }

    private hitTest(sp: Sprite, mouseX: number, mouseY: number): boolean {
        var isHit: boolean = false;
        if (sp.scrollRect) {
            mouseX -= sp._style.scrollRect.x;
            mouseY -= sp._style.scrollRect.y;
        }
        var hitArea: any = sp._style.hitArea;
        if (hitArea && hitArea._hit) {
            return hitArea.contains(mouseX, mouseY);
        }
        if (sp.width > 0 && sp.height > 0 || sp.mouseThrough || hitArea) {
            //判断是否在矩形区域内
            if (!sp.mouseThrough) {
                //MOD by liuzihao: saved call of 'hitRect' and 'this._rect' when 'sp.hitArea' is not null.
                isHit = (hitArea ? hitArea : this._rect.setTo(0, 0, sp.width, sp.height)).contains(mouseX, mouseY);
            } else {
                //如果可穿透，则根据子对象实际大小进行碰撞
                isHit = sp.getGraphicBounds().contains(mouseX, mouseY);
            }
        }
        return isHit;
    }


    private _checkAllBaseUI(mousex: number, mousey: number, callback: Function): boolean {
        var ret: boolean = this.handleExclusiveCapture(this.mouseX, this.mouseY, callback);
        if (ret) return true;
        ret = this.check(this._stage, this.mouseX, this.mouseY, callback);
        //ret = check3DUI(mousex,mousey,callback) || ret;		//在这里调结果不对，好像不会调用click
        return this.handleCapture(this.mouseX, this.mouseY, callback) || ret;
    }

    /**
     * 处理3d界面。
     * @param	mousex
     * @param	mousey
     * @param	callback
     * @return
     */
    check3DUI(mousex: number, mousey: number, callback: Function): boolean {
        var uis: Sprite[] = this._stage._3dUI;
        var i: number = 0;
        var ret: boolean = false;
        for (; i < uis.length; i++) {
            var curui: Sprite = uis[i];
            this._stage._curUIBase = curui;
            if (!curui.destroyed && curui._mouseState > 1 && curui._visible) {
                ret = ret || this.check(curui, this.mouseX, this.mouseY, callback);
            }
        }
        this._stage._curUIBase = this._stage;
        return ret;
    }

    handleExclusiveCapture(mousex: number, mousey: number, callback: Function): boolean {
        if (this._captureExlusiveMode && this._captureSp && this._captureChain.length > 0) {
            var cursp: Sprite;
            // 坐标转到capture对象的相对坐标
            this._point.setTo(mousex, mousey);
            for (var i: number = 0; i < this._captureChain.length; i++) {
                cursp = this._captureChain[i];
                cursp.fromParentPoint(this._point);
            }
            this._target = cursp;
            callback.call(this, cursp);
            return true;
        }
        return false;
    }

    handleCapture(mousex: number, mousey: number, callback: Function): boolean {
        if (!this._hitCaputreSp && this._captureSp && this._captureChain.length > 0) {
            var cursp: Sprite;
            // 坐标转到capture对象的相对坐标
            this._point.setTo(mousex, mousey);
            for (var i: number = 0; i < this._captureChain.length; i++) {
                cursp = this._captureChain[i];
                cursp.fromParentPoint(this._point);
            }
            this._target = cursp;
            callback.call(this, cursp);
            return true;
        }
        return false;
    }

    /**
     * 执行事件处理。
     */
    runEvent(evt: any): void {

        var _this: MouseManager = this;
        var i: number, n: number, touch: any;

        if (evt.type !== 'mousemove') this._prePoint.x = this._prePoint.y = -1000000;

        switch (evt.type) {
            case 'mousedown':
                this._touchIDs[0] = this._id++;
                if (!MouseManager._isTouchRespond) {
                    this._isLeftMouse = evt.button === 0;
                    this.initEvent(evt);
                    this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseDown);
                } else
                    MouseManager._isTouchRespond = false;
                break;
            case 'mouseup':
                this._isLeftMouse = evt.button === 0;
                this.initEvent(evt);
                this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseUp);
                break;
            case 'mousemove':
                if ((Math.abs(this._prePoint.x - evt.clientX) + Math.abs(this._prePoint.y - evt.clientY)) >= this.mouseMoveAccuracy) {
                    this._prePoint.x = evt.clientX;
                    this._prePoint.y = evt.clientY;
                    this.initEvent(evt);
                    this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseMove);
                    //						checkMouseOut();
                }
                break;
            case "touchstart":
                MouseManager._isTouchRespond = true;
                this._isLeftMouse = true;
                var touches: any[] = evt.changedTouches;
                for (i = 0, n = touches.length; i < n; i++) {
                    touch = touches[i];
                    //是否禁用多点触控
                    if (MouseManager.multiTouchEnabled || isNaN(this._curTouchID)) {
                        this._curTouchID = touch.identifier;
                        //200次点击清理一下id资源
                        if (this._id % 200 === 0) this._touchIDs = {};
                        this._touchIDs[touch.identifier] = this._id++;
                        this.initEvent(touch, evt);
                        this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseDown);
                    }
                }

                break;
            case "touchend":
            case "touchcancel":
                MouseManager._isTouchRespond = true;
                this._isLeftMouse = true;
                var touchends: any[] = evt.changedTouches;
                for (i = 0, n = touchends.length; i < n; i++) {
                    touch = touchends[i];
                    //是否禁用多点触控
                    if (MouseManager.multiTouchEnabled || touch.identifier == this._curTouchID) {
                        this._curTouchID = NaN;
                        this.initEvent(touch, evt);
                        var isChecked: boolean;
                        isChecked = this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseUp);
                        if (!isChecked) {
                            this.onMouseUp(null);
                        }
                    }
                }

                break;
            case "touchmove":
                var touchemoves: any[] = evt.changedTouches;
                for (i = 0, n = touchemoves.length; i < n; i++) {
                    touch = touchemoves[i];
                    //是否禁用多点触控
                    if (MouseManager.multiTouchEnabled || touch.identifier == this._curTouchID) {
                        this.initEvent(touch, evt);
                        this._checkAllBaseUI(this.mouseX, this.mouseY, this.onMouseMove);
                    }
                }
                break;
            case "wheel":
            case "mousewheel":
            case "DOMMouseScroll":
                this.checkMouseWheel(evt);
                break;
            case "mouseout":
                //_stage.event(Event.MOUSE_OUT, _event.setTo(Event.MOUSE_OUT, _stage, _stage));
                TouchManager.I.stageMouseOut();
                break;
            case "mouseover":
                this._stage.event(Event.MOUSE_OVER, this._event.setTo(Event.MOUSE_OVER, this._stage, this._stage));
                break;
        }
    }

    /**
     * 
     * @param	sp
     * @param	exlusive  是否是独占模式
     */
    setCapture(sp: Sprite, exclusive: boolean = false): void {
        this._captureSp = sp;
        this._captureExlusiveMode = exclusive;
        this._captureChain.length = 0;
        this._captureChain.push(sp);
        var cursp: Sprite = sp;
        while (true) {
            if (cursp == ILaya.stage) break;
            if (cursp == ILaya.stage._curUIBase) break;
            cursp = (<Sprite>cursp.parent);
            if (!cursp) break;
            this._captureChain.splice(0, 0, cursp);
        }
    }

    releaseCapture(): void {
        console.log('release capture');
        this._captureSp = null;
    }
}

