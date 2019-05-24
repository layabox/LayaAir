import { Pool } from "././Pool";
import { Tween } from "././Tween";
import { Browser } from "././Browser";
import { Handler } from "././Handler";
import { Utils } from "././Utils";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { ILaya } from "ILaya";
/**
 * 整个缓动结束的时候会调度
 * @eventType Event.COMPLETE
 */
/*[Event(name = "complete", type = "laya.events.Event")]*/
/**
 * 当缓动到达标签时会调度。
 * @eventType Event.LABEL
 */
/*[Event(name = "label", type = "laya.events.Event")]*/
/**
 * <code>TimeLine</code> 是一个用来创建时间轴动画的类。
 */
export class TimeLine extends EventDispatcher {
    constructor() {
        super(...arguments);
        this._tweenDic = {};
        this._tweenDataList = [];
        this._currTime = 0;
        this._lastTime = 0;
        this._startTime = 0;
        /**当前动画数据播放到第几个了*/
        this._index = 0;
        /**为TWEEN创建属于自己的唯一标识，方便管理*/
        this._gidIndex = 0;
        /**保留所有对象第一次注册动画时的状态（根据时间跳转时，需要把对象的恢复，再计算接下来的状态）*/
        this._firstTweenDic = {};
        /**是否需要排序*/
        this._startTimeSort = false;
        this._endTimeSort = false;
        /**是否循环*/
        this._loopKey = false;
        /** 缩放动画播放的速度。*/
        this.scale = 1;
        this._frameRate = 60;
        this._frameIndex = 0;
        this._total = 0;
    }
    /**
     * 控制一个对象，从当前点移动到目标点。
     * @param	target		要控制的对象。
     * @param	props		要控制对象的属性。
     * @param	duration	对象TWEEN的时间。
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）。
     */
    static to(target, props, duration, ease = null, offset = 0) {
        return (new TimeLine()).to(target, props, duration, ease, offset);
    }
    /**
     * 从 props 属性，缓动到当前状态。
     * @param	target		target 目标对象(即将更改属性值的对象)
     * @param	props		要控制对象的属性
     * @param	duration	对象TWEEN的时间
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）
     */
    static from(target, props, duration, ease = null, offset = 0) {
        return (new TimeLine()).from(target, props, duration, ease, offset);
    }
    /**
     * 控制一个对象，从当前点移动到目标点。
     * @param	target		要控制的对象。
     * @param	props		要控制对象的属性。
     * @param	duration	对象TWEEN的时间。
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）。
     */
    to(target, props, duration, ease = null, offset = 0) {
        return this._create(target, props, duration, ease, offset, true);
    }
    /**
     * 从 props 属性，缓动到当前状态。
     * @param	target		target 目标对象(即将更改属性值的对象)
     * @param	props		要控制对象的属性
     * @param	duration	对象TWEEN的时间
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）
     */
    from(target, props, duration, ease = null, offset = 0) {
        return this._create(target, props, duration, ease, offset, false);
    }
    /** @private */
    _create(target, props, duration, ease, offset, isTo) {
        var tTweenData = Pool.getItemByClass("tweenData", tweenData);
        tTweenData.isTo = isTo;
        tTweenData.type = 0;
        tTweenData.target = target;
        tTweenData.duration = duration;
        tTweenData.data = props;
        tTweenData.startTime = this._startTime + offset;
        tTweenData.endTime = tTweenData.startTime + tTweenData.duration;
        tTweenData.ease = ease;
        this._startTime = Math.max(tTweenData.endTime, this._startTime);
        this._tweenDataList.push(tTweenData);
        this._startTimeSort = true;
        this._endTimeSort = true;
        return this;
    }
    /**
     * 在时间队列中加入一个标签。
     * @param	label	标签名称。
     * @param	offset	标签相对于上个动画的偏移时间(单位：毫秒)。
     */
    addLabel(label, offset) {
        var tTweenData = Pool.getItemByClass("tweenData", tweenData);
        tTweenData.type = 1;
        tTweenData.data = label;
        tTweenData.endTime = tTweenData.startTime = this._startTime + offset;
        this._labelDic || (this._labelDic = {});
        this._labelDic[label] = tTweenData;
        this._tweenDataList.push(tTweenData);
        return this;
    }
    /**
     * 移除指定的标签
     * @param	label
     */
    removeLabel(label) {
        if (this._labelDic && this._labelDic[label]) {
            var tTweenData = this._labelDic[label];
            if (tTweenData) {
                var tIndex = this._tweenDataList.indexOf(tTweenData);
                if (tIndex > -1) {
                    this._tweenDataList.splice(tIndex, 1);
                }
            }
            delete this._labelDic[label];
        }
    }
    /**
     * 动画从整个动画的某一时间开始。
     * @param	time(单位：毫秒)。
     */
    gotoTime(time) {
        if (this._tweenDataList == null || this._tweenDataList.length == 0)
            return;
        var tTween;
        var tObject;
        for (var p in this._firstTweenDic) {
            tObject = this._firstTweenDic[p];
            if (tObject) {
                for (var tDataP in tObject) {
                    if (tObject.diyTarget.hasOwnProperty(tDataP)) {
                        tObject.diyTarget[tDataP] = tObject[tDataP];
                    }
                }
            }
        }
        for (p in this._tweenDic) {
            tTween = this._tweenDic[p];
            tTween.clear();
            delete this._tweenDic[p];
        }
        this._index = 0;
        this._gidIndex = 0;
        this._currTime = time;
        this._lastTime = Browser.now();
        var tTweenDataCopyList;
        if (this._endTweenDataList == null || this._endTimeSort) {
            this._endTimeSort = false;
            this._endTweenDataList = tTweenDataCopyList = this._tweenDataList.concat();
            //对数据排序
            function Compare(paraA, paraB) {
                if (paraA.endTime > paraB.endTime) {
                    return 1;
                }
                else if (paraA.endTime < paraB.endTime) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
            tTweenDataCopyList.sort(Compare);
        }
        else {
            tTweenDataCopyList = this._endTweenDataList;
        }
        var tTweenData;
        //叠加已经经过的关键帧数据
        for (var i = 0, n = tTweenDataCopyList.length; i < n; i++) {
            tTweenData = tTweenDataCopyList[i];
            if (tTweenData.type == 0) {
                if (time >= tTweenData.endTime) {
                    this._index = Math.max(this._index, i + 1);
                    //把经历过的属性加入到对象中
                    var props = tTweenData.data;
                    if (tTweenData.isTo) {
                        for (var tP in props) {
                            tTweenData.target[tP] = props[tP];
                        }
                    }
                }
                else {
                    break;
                }
            }
        }
        //创建当前正在行动的TWEEN;
        for (i = 0, n = this._tweenDataList.length; i < n; i++) {
            tTweenData = this._tweenDataList[i];
            if (tTweenData.type == 0) {
                if (time >= tTweenData.startTime && time < tTweenData.endTime) {
                    this._index = Math.max(this._index, i + 1);
                    this._gidIndex++;
                    tTween = Pool.getItemByClass("tween", Tween);
                    tTween._create(tTweenData.target, tTweenData.data, tTweenData.duration, tTweenData.ease, Handler.create(this, this._animComplete, [this._gidIndex]), 0, false, tTweenData.isTo, true, false);
                    tTween.setStartTime(this._currTime - (time - tTweenData.startTime));
                    tTween._updateEase(this._currTime);
                    tTween.gid = this._gidIndex;
                    this._tweenDic[this._gidIndex] = tTween;
                }
            }
        }
    }
    /**
     * 从指定的标签开始播。
     * @param	Label 标签名。
     */
    gotoLabel(Label) {
        if (this._labelDic == null)
            return;
        var tLabelData = this._labelDic[Label];
        if (tLabelData)
            this.gotoTime(tLabelData.startTime);
    }
    /**
     * 暂停整个动画。
     */
    pause() {
        ILaya.timer.clear(this, this._update);
    }
    /**
     * 恢复暂停动画的播放。
     */
    resume() {
        this.play(this._currTime, this._loopKey);
    }
    /**
     * 播放动画。
     * @param	timeOrLabel 开启播放的时间点或标签名。
     * @param	loop 是否循环播放。
     */
    play(timeOrLabel = 0, loop = false) {
        if (!this._tweenDataList)
            return;
        if (this._startTimeSort) {
            this._startTimeSort = false;
            //对数据排序
            function Compare(paraA, paraB) {
                if (paraA.startTime > paraB.startTime) {
                    return 1;
                }
                else if (paraA.startTime < paraB.startTime) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
            this._tweenDataList.sort(Compare);
            for (var i = 0, n = this._tweenDataList.length; i < n; i++) {
                var tTweenData = this._tweenDataList[i];
                if (tTweenData != null && tTweenData.type == 0) {
                    var tTarget = tTweenData.target;
                    var gid = (tTarget.$_GID || (tTarget.$_GID = Utils.getGID()));
                    var tSrcData = null;
                    //把对象的初始属性保留下来，方便跳转时，回复到初始状态
                    if (this._firstTweenDic[gid] == null) {
                        tSrcData = {};
                        tSrcData.diyTarget = tTarget;
                        this._firstTweenDic[gid] = tSrcData;
                    }
                    else {
                        tSrcData = this._firstTweenDic[gid];
                    }
                    for (var p in tTweenData.data) {
                        if (tSrcData[p] == null) {
                            tSrcData[p] = tTarget[p];
                        }
                    }
                }
            }
        }
        if (typeof (timeOrLabel) == 'string') {
            this.gotoLabel(timeOrLabel);
        }
        else {
            this.gotoTime(timeOrLabel);
        }
        this._loopKey = loop;
        this._lastTime = Browser.now();
        ILaya.timer.frameLoop(1, this, this._update);
    }
    /**
     * 更新当前动画。
     */
    _update() {
        if (this._currTime >= this._startTime) {
            if (this._loopKey) {
                this._complete();
                if (!this._tweenDataList)
                    return;
                this.gotoTime(0);
            }
            else {
                for (var p in this._tweenDic) {
                    tTween = this._tweenDic[p];
                    tTween.complete();
                }
                this._complete();
                this.pause();
                return;
            }
        }
        var tNow = Browser.now();
        var tFrameTime = tNow - this._lastTime;
        var tCurrTime = this._currTime += tFrameTime * this.scale;
        this._lastTime = tNow;
        for (p in this._tweenDic) {
            tTween = this._tweenDic[p];
            tTween._updateEase(tCurrTime);
        }
        var tTween;
        if (this._tweenDataList.length != 0 && this._index < this._tweenDataList.length) {
            var tTweenData = this._tweenDataList[this._index];
            if (tCurrTime >= tTweenData.startTime) {
                this._index++;
                //创建TWEEN
                if (tTweenData.type == 0) {
                    this._gidIndex++;
                    tTween = Pool.getItemByClass("tween", Tween);
                    tTween._create(tTweenData.target, tTweenData.data, tTweenData.duration, tTweenData.ease, Handler.create(this, this._animComplete, [this._gidIndex]), 0, false, tTweenData.isTo, true, false);
                    tTween.setStartTime(tCurrTime);
                    tTween.gid = this._gidIndex;
                    this._tweenDic[this._gidIndex] = tTween;
                    tTween._updateEase(tCurrTime);
                }
                else {
                    this.event(Event.LABEL, tTweenData.data);
                }
            }
        }
    }
    /**
     * 指定的动画索引处的动画播放完成后，把此动画从列表中删除。
     * @param	index
     */
    _animComplete(index) {
        var tTween = this._tweenDic[index];
        if (tTween)
            delete this._tweenDic[index];
    }
    /** @private */
    _complete() {
        this.event(Event.COMPLETE);
    }
    /**
     * @private
     * 得到帧索引
     */
    get index() {
        return this._frameIndex;
    }
    /**
     * @private
     * 设置帧索引
     */
    set index(value) {
        this._frameIndex = value;
        this.gotoTime(this._frameIndex / this._frameRate * 1000);
    }
    /**
     * 得到总帧数。
     */
    get total() {
        this._total = Math.floor(this._startTime / 1000 * this._frameRate);
        return this._total;
    }
    /**
     * 重置所有对象，复用对象的时候使用。
     */
    reset() {
        var p;
        if (this._labelDic) {
            for (p in this._labelDic) {
                delete this._labelDic[p];
            }
        }
        var tTween;
        for (p in this._tweenDic) {
            tTween = this._tweenDic[p];
            tTween.clear();
            delete this._tweenDic[p];
        }
        for (p in this._firstTweenDic) {
            delete this._firstTweenDic[p];
        }
        this._endTweenDataList = null;
        if (this._tweenDataList && this._tweenDataList.length) {
            var i, len;
            len = this._tweenDataList.length;
            for (i = 0; i < len; i++) {
                if (this._tweenDataList[i])
                    this._tweenDataList[i].destroy();
            }
        }
        this._tweenDataList.length = 0;
        this._currTime = 0;
        this._lastTime = 0;
        this._startTime = 0;
        this._index = 0;
        this._gidIndex = 0;
        this.scale = 1;
        ILaya.timer.clear(this, this._update);
    }
    /**
     * 彻底销毁此对象。
     */
    destroy() {
        this.reset();
        this._labelDic = null;
        this._tweenDic = null;
        this._tweenDataList = null;
        this._firstTweenDic = null;
    }
}
class tweenData {
    constructor() {
        this.type = 0; //0代表TWEEN,1代表标签
        this.isTo = true;
    }
    destroy() {
        this.target = null;
        this.ease = null;
        this.data = null;
        this.isTo = true;
        this.type = 0;
        Pool.recover("tweenData", this);
    }
}
