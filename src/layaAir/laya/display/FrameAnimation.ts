import { AnimationBase } from "./AnimationBase";
import { MathUtil } from "../maths/MathUtil"
import { Ease } from "../utils/Ease"
import { ClassUtils } from "../utils/ClassUtils";

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

    /**@private */
    private static _sortIndexFun(objpre: any, objnext: any) {
        return objpre.index - objnext.index
    }

    /**@internal id对象表*/
    _targetDic: any;
    /**@internal 动画数据*/
    _animationData: any;
    /**@private */
    protected _usedFrames: any[];

    constructor() {
        super();
        if (FrameAnimation._sortIndexFun === undefined) {
            FrameAnimation._sortIndexFun = MathUtil.sortByKey("index", false, true);
        }
    }

    /**
     * @internal
     * 初始化动画数据
     * @param targetDic 节点ID索引
     * @param animationData 动画数据
     */
    _setUp(targetDic: any, animationData: any): void {
        this._targetDic = targetDic;
        this._animationData = animationData;
        this.interval = 1000 / animationData.frameRate;
        if (animationData.parsed) {
            this._count = animationData.count;
            this._labels = animationData.labels;
            this._usedFrames = animationData.animationNewFrames;
        } else {
            this._usedFrames = [];
            this._calculateDatas();

            animationData.parsed = true;
            animationData.labels = this._labels;
            animationData.count = this._count;
            animationData.animationNewFrames = this._usedFrames;
        }
    }

    /**@inheritDoc 
     * @override
    */
    clear(): AnimationBase {
        super.clear();
        this._targetDic = null;
        this._animationData = null;
        return this;
    }

    /**
     * @inheritDoc 
     * @override
     */
    protected _displayToIndex(value: number): void {
        if (!this._animationData) return;
        if (value < 0) value = 0;
        if (value > this._count) value = this._count;
        var nodes: any[] = this._animationData.nodes, i: number, len: number = nodes.length;
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
    protected _displayNodeToFrame(node: any, frame: number, targetDic: any = null): void {
        if (!targetDic) targetDic = this._targetDic;
        var target: any = targetDic[node.target];
        if (!target) {
            //trace("loseTarget:",node.target);
            return;
        }
        var frames: any = node.frames, key: string, propFrames: any[], value: any;
        var keys: any[] = node.keys, i: number, len: number = keys.length;
        for (i = 0; i < len; i++) {
            key = keys[i];
            propFrames = frames[key];
            if (propFrames.length > frame) {
                value = propFrames[frame];
            } else {
                value = propFrames[propFrames.length - 1];
            }
            target[key] = value;
        }
        var funkeys: any[] = node.funkeys;
        len = funkeys.length;
        var funFrames: any;
        if (len == 0) return;
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
    private _calculateDatas(): void {
        if (!this._animationData) return;
        var nodes: any[] = this._animationData.nodes, i: number, len: number = nodes.length, tNode: any;
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
    protected _calculateKeyFrames(node: any): void {
        var keyFrames: any = node.keyframes, key: string, tKeyFrames: any[], target: number = node.target;
        if (!node.frames) node.frames = {};
        if (!node.keys) node.keys = [];
        else node.keys.length = 0;

        if (!node.funkeys) node.funkeys = [];
        else node.funkeys.length = 0;

        if (!node.initValues) node.initValues = {};
        for (key in keyFrames) {
            var isFun: boolean = key.indexOf("()") != -1;
            tKeyFrames = keyFrames[key];
            if (isFun) key = key.substr(0, key.length - 2);
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
                var map: any[] = node.frames[key];
                for (var i: number = 0; i < tKeyFrames.length; i++) {
                    var temp: any = tKeyFrames[i];
                    map[temp.index] = temp.value;
                    if (temp.index > this._count) this._count = temp.index;
                }
            }

        }
    }

    /**
     * 重置节点，使节点恢复到动画之前的状态，方便其他动画控制
     */
    resetNodes(): void {
        if (!this._targetDic) return;
        if (!this._animationData) return;
        var nodes: any[] = this._animationData.nodes, i: number, len: number = nodes.length;
        var tNode: any;
        var initValues: any;
        for (i = 0; i < len; i++) {
            tNode = nodes[i];
            initValues = tNode.initValues;
            if (!initValues) continue;
            var target: any = this._targetDic[tNode.target];
            if (!target) continue;
            var key: string;
            for (key in initValues) {
                target[key] = initValues[key];
            }
        }
    }

    /**
     * @private
     * 计算节点某个属性的帧数据
     */
    private _calculateNodePropFrames(keyframes: any[], frames: any[], key: string, target: number): void {
        var i: number, len: number = keyframes.length - 1;
        frames.length = keyframes[len].index + 1;
        for (i = 0; i < len; i++) {
            this._dealKeyFrame(keyframes[i]);
            this._calculateFrameValues(keyframes[i], keyframes[i + 1], frames);
        }
        if (len == 0) {
            frames[0] = keyframes[0].value;
            if (this._usedFrames) this._usedFrames[keyframes[0].index] = true;
        }
        this._dealKeyFrame(keyframes[i]);
    }

    /**
     * @private
     */
    private _dealKeyFrame(keyFrame: any): void {
        if (keyFrame.label && keyFrame.label != "") this.addLabel(keyFrame.label, keyFrame.index);
    }

    /**
     * @private
     * 计算两个关键帧直接的帧数据
     */
    private _calculateFrameValues(startFrame: any, endFrame: any, result: any[]): void {
        var i: number, easeFun: Function;
        var start: number = startFrame.index, end: number = endFrame.index;
        var startValue: number = startFrame.value;
        var dValue: number = endFrame.value - startFrame.value;
        var dLen: number = end - start;
        var frames: any[] = this._usedFrames;
        if (end > this._count) this._count = end;
        if (startFrame.tween) {
            easeFun = (Ease as any)[startFrame.tweenMethod];
            if (easeFun == null) easeFun = Ease.linearNone;
            for (i = start; i < end; i++) {
                result[i] = easeFun(i - start, startValue, dValue, dLen);
                if (frames) frames[i] = true;
            }
        } else {
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


ClassUtils.regClass("laya.display.FrameAnimation", FrameAnimation);
ClassUtils.regClass("Laya.FrameAnimation", FrameAnimation);