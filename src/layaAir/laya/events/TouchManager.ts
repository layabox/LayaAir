import { Event } from "./Event";
import { Node } from "../display/Node"
//import { Sprite } from "../display/Sprite"
import { Browser } from "../utils/Browser"
import { Pool } from "../utils/Pool"
import { ILaya } from "../../ILaya";

/**
 * @private
 * Touch事件管理类，处理多点触控下的鼠标事件
 */
export class TouchManager {

    static I: TouchManager = new TouchManager();
    private static _oldArr: any[] = [];
    private static _newArr: any[] = [];
    private static _tEleArr: any[] = [];
    /**
     * 当前over的touch表
     */
    private preOvers: any[] = [];
    /**
     * 当前down的touch表
     */
    private preDowns: any[] = [];
    private preRightDowns: any[] = [];
    /**
     * 是否启用
     */
    enable: boolean = true;

    /**
     * @internal
     * 用于派发事件用的Event对象
     */
    _event: Event = new Event();

    private _lastClickTime: number = 0;

    private _clearTempArrs(): void {
        TouchManager._oldArr.length = 0;
        TouchManager._newArr.length = 0;
        TouchManager._tEleArr.length = 0;
    }

    /**
     * 从touch表里查找对应touchID的数据
     * @param touchID touch ID
     * @param arr touch表
     * @return
     *
     */
    private getTouchFromArr(touchID: number, arr: any[]): any {
        var i: number, len: number;
        len = arr.length;
        var tTouchO: any;
        for (i = 0; i < len; i++) {
            tTouchO = arr[i];
            if (tTouchO.id == touchID) {
                return tTouchO;
            }
        }
        return null;
    }

    /**
     * 从touch表里移除一个元素
     * @param touchID touch ID
     * @param arr touch表
     *
     */
    private removeTouchFromArr(touchID: number, arr: any[]): void {
        //DebugTxt.dTrace("removeTouch:"+touchID);
        var i: number;
        for (i = arr.length - 1; i >= 0; i--) {
            if (arr[i].id == touchID) {
                //DebugTxt.dTrace("removeedTouch:"+touchID);
                arr.splice(i, 1);
            }
        }
    }

    /**
     * 创建一个touch数据
     * @param ele 当前的根节点
     * @param touchID touchID
     * @return
     *
     */
    private createTouchO(ele: any, touchID: number): any {
        var rst: any;
        rst = Pool.getItem("TouchData") || {};
        rst.id = touchID;
        rst.tar = ele;

        return rst;
    }

    /**
     * 处理touchStart
     * @param ele		根节点
     * @param touchID	touchID
     * @param isLeft	（可选）是否为左键
     */
    onMouseDown(ele: any, touchID: number, isLeft: boolean = false): void {
        if (!this.enable)
            return;
        var preO: any;
        var tO: any;
        var arrs: any[];
        preO = this.getTouchFromArr(touchID, this.preOvers);

        arrs = this.getEles(ele, null, TouchManager._tEleArr);
        if (!preO) {
            tO = this.createTouchO(ele, touchID);
            this.preOvers.push(tO);
        } else {
            //理论上不会发生，相同触摸事件必然不会在end之前再次出发
            preO.tar = ele;
        }
        if (Browser.onMobile)
            this.sendEvents(arrs, Event.MOUSE_OVER);

        var preDowns: any[];
        preDowns = isLeft ? this.preDowns : this.preRightDowns;
        preO = this.getTouchFromArr(touchID, preDowns);
        if (!preO) {
            tO = this.createTouchO(ele, touchID);
            preDowns.push(tO);
        } else {
            //理论上不会发生，相同触摸事件必然不会在end之前再次出发
            preO.tar = ele;

        }
        this.sendEvents(arrs, isLeft ? Event.MOUSE_DOWN : Event.RIGHT_MOUSE_DOWN);
        this._clearTempArrs();

    }

    /**
     * 派发事件。
     * @param eles		对象列表。
     * @param type		事件类型。
     */
    private sendEvents(eles: any[], type: string): void {
        var i: number, len: number;
        len = eles.length;
        this._event._stoped = false;
        var _target: any;
        _target = eles[0];
        for (i = 0; i < len; i++) {
            var tE = eles[i];
            if (tE.destroyed) return;
            tE.event(type, this._event.setTo(type, tE, _target));
            if (this._event._stoped)
                break;
        }
    }

    /**
     * 获取对象列表。
     * @param start	起始节点。
     * @param end	结束节点。
     * @param rst	返回值。如果此值不为空，则将其赋值为计算结果，从而避免创建新数组；如果此值为空，则创建新数组返回。
     * @return Array 返回节点列表。
     */
    private getEles(start: Node, end: Node = null, rst: any[] = null): any[] {
        if (!rst) {
            rst = [];
        } else {
            rst.length = 0;
        }
        while (start && start != end) {
            rst.push(start);
            start = start.parent;
        }
        return rst;
    }

    /**
     * touchMove时处理out事件和over时间。
     * @param eleNew	新的根节点。
     * @param elePre	旧的根节点。
     * @param touchID	（可选）touchID，默认为0。
     */
    private checkMouseOutAndOverOfMove(eleNew: Node, elePre: Node, touchID: number = 0): void {
        if (elePre == eleNew)
            return;
        var tar: Node;
        var arrs: any[];
        var i: number, len: number;
        if (elePre.contains(eleNew)) {
            arrs = this.getEles(eleNew, elePre, TouchManager._tEleArr);
            this.sendEvents(arrs, Event.MOUSE_OVER);
        } else if (eleNew.contains(elePre)) {
            arrs = this.getEles(elePre, eleNew, TouchManager._tEleArr);
            this.sendEvents(arrs, Event.MOUSE_OUT);
        } else {
            //arrs = getEles(elePre);
            arrs = TouchManager._tEleArr;
            arrs.length = 0;
            var oldArr: any[];
            oldArr = this.getEles(elePre, null, TouchManager._oldArr);
            var newArr: any[];
            newArr = this.getEles(eleNew, null, TouchManager._newArr);
            len = oldArr.length;
            var tIndex: number;
            for (i = 0; i < len; i++) {
                tar = oldArr[i];
                tIndex = newArr.indexOf(tar);
                if (tIndex >= 0) {
                    newArr.splice(tIndex, newArr.length - tIndex);
                    break;

                } else {
                    arrs.push(tar);
                }
            }
            if (arrs.length > 0) {
                this.sendEvents(arrs, Event.MOUSE_OUT);
            }

            if (newArr.length > 0) {
                this.sendEvents(newArr, Event.MOUSE_OVER);
            }
        }
    }

    /**
     * 处理TouchMove事件
     * @param ele 根节点
     * @param touchID touchID
     *
     */
    onMouseMove(ele: any, touchID: number): void {
        if (!this.enable)
            return;
        //DebugTxt.dTrace("onMouseMove:"+touchID);
        var preO: any;
        preO = this.getTouchFromArr(touchID, this.preOvers);
        var arrs: any[];

        var tO: any;
        if (!preO) {
            //理论上不会发生，因为必然先有touchstart再有touchMove
            arrs = this.getEles(ele, null, TouchManager._tEleArr);
            this.sendEvents(arrs, Event.MOUSE_OVER);
            this.preOvers.push(this.createTouchO(ele, touchID));
        } else {
            this.checkMouseOutAndOverOfMove(ele, preO.tar);
            preO.tar = ele;
            arrs = this.getEles(ele, null, TouchManager._tEleArr);
        }

        this.sendEvents(arrs, Event.MOUSE_MOVE);
        this._clearTempArrs();
    }

    getLastOvers(): any[] {
        TouchManager._tEleArr.length = 0;
        if (this.preOvers.length > 0 && this.preOvers[0].tar) {
            return this.getEles(this.preOvers[0].tar, null, TouchManager._tEleArr);
        }
        TouchManager._tEleArr.push(ILaya.stage);
        return TouchManager._tEleArr;
    }

    stageMouseOut(): void {
        var lastOvers: any[];
        lastOvers = this.getLastOvers();
        this.preOvers.length = 0;
        this.sendEvents(lastOvers, Event.MOUSE_OUT);
    }

    /**
     * 处理TouchEnd事件
     * @param ele		根节点
     * @param touchID	touchID
     * @param isLeft	是否为左键
     */
    onMouseUp(ele: any, touchID: number, isLeft: boolean = false): void {
        if (!this.enable)
            return;
        var preO: any;
        var tO: any;
        var arrs: any[];
        var oldArr: any[];
        var i: number, len: number;
        var tar: Node;
        var sendArr: any[];

        var onMobile: boolean = Browser.onMobile;

        //处理up
        arrs = this.getEles(ele, null, TouchManager._tEleArr);
        this.sendEvents(arrs, isLeft ? Event.MOUSE_UP : Event.RIGHT_MOUSE_UP);

        //处理click
        var preDowns: any[];
        preDowns = isLeft ? this.preDowns : this.preRightDowns;
        preO = this.getTouchFromArr(touchID, preDowns);
        if (!preO) {

        } else {
            var isDouble: boolean;
            var now: number = Browser.now();
            isDouble = now - this._lastClickTime < 300;
            this._lastClickTime = now;
            if (ele == preO.tar) {
                sendArr = arrs;
            } else {
                oldArr = this.getEles(preO.tar, null, TouchManager._oldArr);
                sendArr = TouchManager._newArr;
                sendArr.length = 0;
                len = oldArr.length;
                for (i = 0; i < len; i++) {
                    tar = oldArr[i];
                    if (arrs.indexOf(tar) >= 0) {
                        sendArr.push(tar);
                    }
                }
            }

            if (sendArr.length > 0) {
                this.sendEvents(sendArr, isLeft ? Event.CLICK : Event.RIGHT_CLICK);
            }
            if (isLeft && isDouble) {
                this.sendEvents(sendArr, Event.DOUBLE_CLICK);
            }
            this.removeTouchFromArr(touchID, preDowns);
            preO.tar = null;
            Pool.recover("TouchData", preO);
        }

        //处理out
        preO = this.getTouchFromArr(touchID, this.preOvers);
        if (!preO) {
            //理论上不会发生，因为必然先有touchstart再有touchEnd
        } else {
            if (onMobile) {
                sendArr = this.getEles(preO.tar, null, sendArr);
                if (sendArr && sendArr.length > 0) {
                    this.sendEvents(sendArr, Event.MOUSE_OUT);
                }
                this.removeTouchFromArr(touchID, this.preOvers);
                preO.tar = null;
                Pool.recover("TouchData", preO);
            }
        }
        this._clearTempArrs();
    }
}

