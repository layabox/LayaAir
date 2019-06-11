import { AnimationClipParser03 } from "././AnimationClipParser03";
import { AnimationClipParser04 } from "././AnimationClipParser04";
import { Laya } from "Laya";
import { KeyframeNodeList } from "././KeyframeNodeList";
import { Quaternion } from "../math/Quaternion";
import { Utils3D } from "../utils/Utils3D";
import { LayaGL } from "laya/layagl/LayaGL";
import { Resource } from "laya/resource/Resource";
import { Byte } from "laya/utils/Byte";
/**
 * <code>AnimationClip</code> 类用于动画片段资源。
 */
export class AnimationClip extends Resource {
    /**
     * 创建一个 <code>AnimationClip</code> 实例。
     */
    constructor() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        /**@private */
        this._nodes = new KeyframeNodeList();
        this._animationEvents = [];
    }
    /**
     * @inheritDoc
     */
    static _parse(data, propertyParams = null, constructParams = null) {
        var clip = new AnimationClip();
        var reader = new Byte(data);
        var version = reader.readUTFString();
        switch (version) {
            case "LAYAANIMATION:03":
                AnimationClipParser03.parse(clip, reader);
                break;
            case "LAYAANIMATION:04":
            case "LAYAANIMATION:COMPRESSION_04":
                AnimationClipParser04.parse(clip, reader, version);
                break;
            default:
                throw "unknown animationClip version.";
        }
        return clip;
    }
    /**
     * 加载动画片段。
     * @param url 动画片段地址。
     * @param complete  完成回掉。
     */
    static load(url, complete) {
        Laya.loader.create(url, complete, null, AnimationClip.ANIMATIONCLIP);
    }
    /**
     * 获取动画片段时长。
     */
    duration() {
        return this._duration;
    }
    /**
     * @private
     */
    _hermiteInterpolate(frame, nextFrame, t, dur) {
        var t0 = frame.outTangent, t1 = nextFrame.inTangent;
        if (Number.isFinite(t0) && Number.isFinite(t1)) {
            var t2 = t * t;
            var t3 = t2 * t;
            var a = 2.0 * t3 - 3.0 * t2 + 1.0;
            var b = t3 - 2.0 * t2 + t;
            var c = t3 - t2;
            var d = -2.0 * t3 + 3.0 * t2;
            return a * frame.value + b * t0 * dur + c * t1 * dur + d * nextFrame.value;
        }
        else
            return frame.value;
    }
    /**
     * @private
     */
    _hermiteInterpolateVector3(frame, nextFrame, t, dur, out) {
        var p0 = frame.value;
        var tan0 = frame.outTangent;
        var p1 = nextFrame.value;
        var tan1 = nextFrame.inTangent;
        var t2 = t * t;
        var t3 = t2 * t;
        var a = 2.0 * t3 - 3.0 * t2 + 1.0;
        var b = t3 - 2.0 * t2 + t;
        var c = t3 - t2;
        var d = -2.0 * t3 + 3.0 * t2;
        var t0 = tan0.x, t1 = tan1.x;
        if (Number.isFinite(t0) && Number.isFinite(t1))
            out.x = a * p0.x + b * t0 * dur + c * t1 * dur + d * p1.x;
        else
            out.x = p0.x;
        t0 = tan0.y, t1 = tan1.y;
        if (Number.isFinite(t0) && Number.isFinite(t1))
            out.y = a * p0.y + b * t0 * dur + c * t1 * dur + d * p1.y;
        else
            out.y = p0.y;
        t0 = tan0.z, t1 = tan1.z;
        if (Number.isFinite(t0) && Number.isFinite(t1))
            out.z = a * p0.z + b * t0 * dur + c * t1 * dur + d * p1.z;
        else
            out.z = p0.z;
    }
    /**
     * @private
     */
    _hermiteInterpolateQuaternion(frame, nextFrame, t, dur, out) {
        var p0 = frame.value;
        var tan0 = frame.outTangent;
        var p1 = nextFrame.value;
        var tan1 = nextFrame.inTangent;
        var t2 = t * t;
        var t3 = t2 * t;
        var a = 2.0 * t3 - 3.0 * t2 + 1.0;
        var b = t3 - 2.0 * t2 + t;
        var c = t3 - t2;
        var d = -2.0 * t3 + 3.0 * t2;
        var t0 = tan0.x, t1 = tan1.x;
        if (Number.isFinite(t0) && Number.isFinite(t1))
            out.x = a * p0.x + b * t0 * dur + c * t1 * dur + d * p1.x;
        else
            out.x = p0.x;
        t0 = tan0.y, t1 = tan1.y;
        if (Number.isFinite(t0) && Number.isFinite(t1))
            out.y = a * p0.y + b * t0 * dur + c * t1 * dur + d * p1.y;
        else
            out.y = p0.y;
        t0 = tan0.z, t1 = tan1.z;
        if (Number.isFinite(t0) && Number.isFinite(t1))
            out.z = a * p0.z + b * t0 * dur + c * t1 * dur + d * p1.z;
        else
            out.z = p0.z;
        t0 = tan0.w, t1 = tan1.w;
        if (Number.isFinite(t0) && Number.isFinite(t1))
            out.w = a * p0.w + b * t0 * dur + c * t1 * dur + d * p1.w;
        else
            out.w = p0.w;
    }
    /**
     * @private
     */
    _evaluateClipDatasRealTime(nodes, playCurTime, realTimeCurrentFrameIndexes, addtive, frontPlay) {
        for (var i = 0, n = nodes.count; i < n; i++) {
            var node = nodes.getNodeByIndex(i);
            var type = node.type;
            var nextFrameIndex;
            var keyFrames = node._keyFrames;
            var keyFramesCount = keyFrames.length;
            var frameIndex = realTimeCurrentFrameIndexes[i];
            if (frontPlay) {
                if ((frameIndex !== -1) && (playCurTime < keyFrames[frameIndex].time)) { //重置正向循环
                    frameIndex = -1;
                    realTimeCurrentFrameIndexes[i] = frameIndex;
                }
                nextFrameIndex = frameIndex + 1;
                while (nextFrameIndex < keyFramesCount) {
                    if (keyFrames[nextFrameIndex].time > playCurTime)
                        break;
                    frameIndex++;
                    nextFrameIndex++;
                    realTimeCurrentFrameIndexes[i] = frameIndex;
                }
            }
            else {
                nextFrameIndex = frameIndex + 1;
                if ((nextFrameIndex !== keyFramesCount) && (playCurTime > keyFrames[nextFrameIndex].time)) { //重置逆向循环
                    frameIndex = keyFramesCount - 1;
                    realTimeCurrentFrameIndexes[i] = frameIndex;
                }
                nextFrameIndex = frameIndex + 1;
                while (frameIndex > -1) {
                    if (keyFrames[frameIndex].time < playCurTime)
                        break;
                    frameIndex--;
                    nextFrameIndex--;
                    realTimeCurrentFrameIndexes[i] = frameIndex;
                }
            }
            var isEnd = nextFrameIndex === keyFramesCount;
            switch (type) {
                case 0:
                    if (frameIndex !== -1) {
                        var frame = keyFrames[frameIndex];
                        if (isEnd) { //如果nextFarme为空，不修改数据，保持上一帧
                            node.data = frame.value;
                        }
                        else {
                            var nextFarme = keyFrames[nextFrameIndex];
                            var d = nextFarme.time - frame.time;
                            var t;
                            if (d !== 0)
                                t = (playCurTime - frame.time) / d;
                            else
                                t = 0;
                            node.data = this._hermiteInterpolate(frame, nextFarme, t, d);
                        }
                    }
                    else {
                        node.data = keyFrames[0].value;
                    }
                    if (addtive)
                        node.data -= keyFrames[0].value;
                    break;
                case 1:
                case 4:
                    var clipData = node.data;
                    this._evaluateFrameNodeVector3DatasRealTime(keyFrames, frameIndex, isEnd, playCurTime, clipData);
                    if (addtive) {
                        var firstFrameValue = keyFrames[0].value;
                        clipData.x -= firstFrameValue.x;
                        clipData.y -= firstFrameValue.y;
                        clipData.z -= firstFrameValue.z;
                    }
                    break;
                case 2:
                    var clipQuat = node.data;
                    this._evaluateFrameNodeQuaternionDatasRealTime(keyFrames, frameIndex, isEnd, playCurTime, clipQuat);
                    if (addtive) {
                        var tempQuat = AnimationClip._tempQuaternion0;
                        var firstFrameValueQua = keyFrames[0].value;
                        Utils3D.quaternionConjugate(firstFrameValueQua, tempQuat);
                        Quaternion.multiply(tempQuat, clipQuat, clipQuat);
                    }
                    break;
                case 3:
                    clipData = node.data;
                    this._evaluateFrameNodeVector3DatasRealTime(keyFrames, frameIndex, isEnd, playCurTime, clipData);
                    if (addtive) {
                        firstFrameValue = keyFrames[0].value;
                        clipData.x /= firstFrameValue.x;
                        clipData.y /= firstFrameValue.y;
                        clipData.z /= firstFrameValue.z;
                    }
                    break;
                default:
                    throw "AnimationClip:unknown node type.";
            }
        }
    }
    _evaluateClipDatasRealTimeForNative(nodes, playCurTime, realTimeCurrentFrameIndexes, addtive) {
        LayaGL.instance.evaluateClipDatasRealTime(nodes._nativeObj, playCurTime, realTimeCurrentFrameIndexes, addtive);
    }
    /**
     * @private
     */
    _evaluateFrameNodeVector3DatasRealTime(keyFrames, frameIndex, isEnd, playCurTime, outDatas) {
        if (frameIndex !== -1) {
            var frame = keyFrames[frameIndex];
            if (isEnd) {
                var frameData = frame.value;
                outDatas.x = frameData.x; //不能设为null，会造成跳过当前帧数据
                outDatas.y = frameData.y;
                outDatas.z = frameData.z;
            }
            else {
                var nextKeyFrame = keyFrames[frameIndex + 1];
                var t;
                var startTime = frame.time;
                var d = nextKeyFrame.time - startTime;
                if (d !== 0)
                    t = (playCurTime - startTime) / d;
                else
                    t = 0;
                this._hermiteInterpolateVector3(frame, nextKeyFrame, t, d, outDatas);
            }
        }
        else {
            var firstFrameDatas = keyFrames[0].value;
            outDatas.x = firstFrameDatas.x;
            outDatas.y = firstFrameDatas.y;
            outDatas.z = firstFrameDatas.z;
        }
    }
    /**
     * @private
     */
    _evaluateFrameNodeQuaternionDatasRealTime(keyFrames, frameIndex, isEnd, playCurTime, outDatas) {
        if (frameIndex !== -1) {
            var frame = keyFrames[frameIndex];
            if (isEnd) {
                var frameData = frame.value;
                outDatas.x = frameData.x; //不能设为null，会造成跳过当前帧数据
                outDatas.y = frameData.y;
                outDatas.z = frameData.z;
                outDatas.w = frameData.w;
            }
            else {
                var nextKeyFrame = keyFrames[frameIndex + 1];
                var t;
                var startTime = frame.time;
                var d = nextKeyFrame.time - startTime;
                if (d !== 0)
                    t = (playCurTime - startTime) / d;
                else
                    t = 0;
                this._hermiteInterpolateQuaternion(frame, nextKeyFrame, t, d, outDatas);
            }
        }
        else {
            var firstFrameDatas = keyFrames[0].value;
            outDatas.x = firstFrameDatas.x;
            outDatas.y = firstFrameDatas.y;
            outDatas.z = firstFrameDatas.z;
            outDatas.w = firstFrameDatas.w;
        }
    }
    /**
     * @private
     */
    _binarySearchEventIndex(time) {
        var start = 0;
        var end = this._animationEvents.length - 1;
        var mid;
        while (start <= end) {
            mid = Math.floor((start + end) / 2);
            var midValue = this._animationEvents[mid].time;
            if (midValue == time)
                return mid;
            else if (midValue > time)
                end = mid - 1;
            else
                start = mid + 1;
        }
        return start;
    }
    /**
     * 添加动画事件。
     */
    addEvent(event) {
        var index = this._binarySearchEventIndex(event.time);
        this._animationEvents.splice(index, 0, event);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _disposeResource() {
        this._nodes = null;
        this._nodesMap = null;
    }
}
/**AnimationClip资源。*/
AnimationClip.ANIMATIONCLIP = "ANIMATIONCLIP";
/**@private	*/
AnimationClip._tempQuaternion0 = new Quaternion();
