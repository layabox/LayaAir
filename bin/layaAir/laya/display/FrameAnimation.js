import { AnimationBase } from "././AnimationBase";
import { MathUtil } from "../maths/MathUtil";
import { Ease } from "../utils/Ease";
/**
 * 动画播放完毕后调度。
 * @eventType Event.COMPLETE
 */
/*[Event(name = "complete", type = "laya.events.Event")]*/
/**
 * 播放到某标签后调度。
 * @eventType Event.LABEL
 */
/*[Event(name = "label", type = "laya.events.Event")]*/
/**
 * 节点关键帧动画播放类。解析播放IDE内制作的节点动画。
 */
export class FrameAnimation extends AnimationBase {
    constructor() {
        super();
        if (FrameAnimation._sortIndexFun === null) {
            FrameAnimation._sortIndexFun = MathUtil.sortByKey("index", false, true);
        }
    }
    /**
     * @private
     * 初始化动画数据
     * @param targetDic 节点ID索引
     * @param animationData 动画数据
     */
    _setUp(targetDic, animationData) {
        this._targetDic = targetDic;
        this._animationData = animationData;
        this.interval = 1000 / animationData.frameRate;
        if (animationData.parsed) {
            this._count = animationData.count;
            this._labels = animationData.labels;
            this._usedFrames = animationData.animationNewFrames;
        }
        else {
            this._usedFrames = [];
            this._calculateDatas();
            animationData.parsed = true;
            animationData.labels = this._labels;
            animationData.count = this._count;
            animationData.animationNewFrames = this._usedFrames;
        }
    }
    /**@inheritDoc */
    /*override*/ clear() {
        super.clear();
        this._targetDic = null;
        this._animationData = null;
        return this;
    }
    /**@inheritDoc */
    /*override*/ _displayToIndex(value) {
        if (!this._animationData)
            return;
        if (value < 0)
            value = 0;
        if (value > this._count)
            value = this._count;
        var nodes = this._animationData.nodes, i, len = nodes.length;
        for (i = 0; i < len; i++) {
            this._displayNodeToFrame(nodes[i], value);
        }
    }
    /**
     * @private
     * 将节点设置到某一帧的状态
     * @param node 节点ID
     * @param frame
     * @param targetDic 节点表
     */
    _displayNodeToFrame(node, frame, targetDic = null) {
        if (!targetDic)
            targetDic = this._targetDic;
        var target = targetDic[node.target];
        if (!target) {
            //trace("loseTarget:",node.target);
            return;
        }
        var frames = node.frames, key, propFrames, value;
        var keys = node.keys, i, len = keys.length;
        for (i = 0; i < len; i++) {
            key = keys[i];
            propFrames = frames[key];
            if (propFrames.length > frame) {
                value = propFrames[frame];
            }
            else {
                value = propFrames[propFrames.length - 1];
            }
            target[key] = value;
        }
        var funkeys = node.funkeys;
        len = funkeys.length;
        var funFrames;
        if (len == 0)
            return;
        for (i = 0; i < len; i++) {
            key = funkeys[i];
            funFrames = frames[key];
            if (funFrames[frame] !== undefined) {
                target[key] && target[key].apply(target, funFrames[frame]);
            }
        }
    }
    /**
     * @private
     * 计算帧数据
     */
    _calculateDatas() {
        if (!this._animationData)
            return;
        var nodes = this._animationData.nodes, i, len = nodes.length, tNode;
        this._count = 0;
        for (i = 0; i < len; i++) {
            tNode = nodes[i];
            this._calculateKeyFrames(tNode);
        }
        this._count += 1;
    }
    /**
     * @private
     * 计算某个节点的帧数据
     */
    _calculateKeyFrames(node) {
        var keyFrames = node.keyframes, key, tKeyFrames, target = node.target;
        if (!node.frames)
            node.frames = {};
        if (!node.keys)
            node.keys = [];
        else
            node.keys.length = 0;
        if (!node.funkeys)
            node.funkeys = [];
        else
            node.funkeys.length = 0;
        if (!node.initValues)
            node.initValues = {};
        for (key in keyFrames) {
            var isFun = key.indexOf("()") != -1;
            tKeyFrames = keyFrames[key];
            if (isFun)
                key = key.substr(0, key.length - 2);
            if (!node.frames[key]) {
                node.frames[key] = [];
            }
            if (!isFun) {
                if (this._targetDic && this._targetDic[target]) {
                    node.initValues[key] = this._targetDic[target][key];
                }
                tKeyFrames.sort(FrameAnimation._sortIndexFun);
                node.keys.push(key);
                this._calculateNodePropFrames(tKeyFrames, node.frames[key], key, target);
            }
            else {
                node.funkeys.push(key);
                var map = node.frames[key];
                for (var i = 0; i < tKeyFrames.length; i++) {
                    var temp = tKeyFrames[i];
                    map[temp.index] = temp.value;
                    if (temp.index > this._count)
                        this._count = temp.index;
                }
            }
        }
    }
    /**
     * 重置节点，使节点恢复到动画之前的状态，方便其他动画控制
     */
    resetNodes() {
        if (!this._targetDic)
            return;
        if (!this._animationData)
            return;
        var nodes = this._animationData.nodes, i, len = nodes.length;
        var tNode;
        var initValues;
        for (i = 0; i < len; i++) {
            tNode = nodes[i];
            initValues = tNode.initValues;
            if (!initValues)
                continue;
            var target = this._targetDic[tNode.target];
            if (!target)
                continue;
            var key;
            for (key in initValues) {
                target[key] = initValues[key];
            }
        }
    }
    /**
     * @private
     * 计算节点某个属性的帧数据
     */
    _calculateNodePropFrames(keyframes, frames, key, target) {
        var i, len = keyframes.length - 1;
        frames.length = keyframes[len].index + 1;
        for (i = 0; i < len; i++) {
            this._dealKeyFrame(keyframes[i]);
            this._calculateFrameValues(keyframes[i], keyframes[i + 1], frames);
        }
        if (len == 0) {
            frames[0] = keyframes[0].value;
            if (this._usedFrames)
                this._usedFrames[keyframes[0].index] = true;
        }
        this._dealKeyFrame(keyframes[i]);
    }
    /**
     * @private
     */
    _dealKeyFrame(keyFrame) {
        if (keyFrame.label && keyFrame.label != "")
            this.addLabel(keyFrame.label, keyFrame.index);
    }
    /**
     * @private
     * 计算两个关键帧直接的帧数据
     */
    _calculateFrameValues(startFrame, endFrame, result) {
        var i, easeFun;
        var start = startFrame.index, end = endFrame.index;
        var startValue = startFrame.value;
        var dValue = endFrame.value - startFrame.value;
        var dLen = end - start;
        var frames = this._usedFrames;
        if (end > this._count)
            this._count = end;
        if (startFrame.tween) {
            easeFun = Ease[startFrame.tweenMethod];
            if (easeFun == null)
                easeFun = Ease.linearNone;
            for (i = start; i < end; i++) {
                result[i] = easeFun(i - start, startValue, dValue, dLen);
                if (frames)
                    frames[i] = true;
            }
        }
        else {
            for (i = start; i < end; i++) {
                result[i] = startValue;
            }
        }
        if (frames) {
            frames[startFrame.index] = true;
            frames[endFrame.index] = true;
        }
        result[endFrame.index] = endFrame.value;
    }
}
