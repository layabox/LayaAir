import { AnimationParser01 } from "./AnimationParser01";
import { AnimationParser02 } from "./AnimationParser02";
import { Resource } from "../resource/Resource";
import { MathUtil } from "../maths/MathUtil";
import { IAniLib } from "./AniLibPack";
import { Byte } from "../utils/Byte";
import { BezierLerp } from "./math/BezierLerp";
/**
 * <code>AnimationTemplet</code> 类用于动画模板资源。
 */
export class AnimationTemplet extends Resource {
    constructor() {
        super();
        /**@internal */
        this._anis = [];
        /**@internal */
        this._aniMap = {};
        /**@private */
        this.unfixedLastAniIndex = -1;
        /**@internal */
        this._fullFrames = null;
        /**@private */
        this._boneCurKeyFrm = []; // 记录每个骨骼当前在动画的第几帧。这个是为了去掉缓存的帧索引数据。TODO 其实这个应该放到skeleton中
    }
    /**
     * @private
     */
    //TODO:coverage
    static _LinearInterpolation_0(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        out[outOfs] = data[index] + dt * dData[index];
        return 1;
    }
    /**
     * @private
     */
    //TODO:coverage
    static _QuaternionInterpolation_1(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        var amount = duration === 0 ? 0 : dt / duration;
        MathUtil.slerpQuaternionArray(data, index, nextData, index, amount, out, outOfs); //(dt/duration)为amount比例
        return 4;
    }
    /**
     * @private
     */
    //TODO:coverage
    static _AngleInterpolation_2(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        return 0;
    }
    /**
     * @private
     */
    //TODO:coverage
    static _RadiansInterpolation_3(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        return 0;
    }
    /**
     * @private
     */
    //TODO:coverage
    static _Matrix4x4Interpolation_4(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        for (var i = 0; i < 16; i++, index++)
            out[outOfs + i] = data[index] + dt * dData[index];
        return 16;
    }
    /**
     * @private
     */
    //TODO:coverage
    static _NoInterpolation_5(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        out[outOfs] = data[index];
        return 1;
    }
    /**
     * @private
     */
    //TODO:coverage
    static _BezierInterpolation_6(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null, offset = 0) {
        out[outOfs] = data[index] + (nextData[index] - data[index]) * BezierLerp.getBezierRate(dt / duration, interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
        return 5;
    }
    /**
     * @private
     */
    //TODO:coverage
    static _BezierInterpolation_7(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null, offset = 0) {
        //interData=[x0,y0,x1,y1,start,d,offTime,allTime]
        out[outOfs] = interData[offset + 4] + interData[offset + 5] * BezierLerp.getBezierRate((dt * 0.001 + interData[offset + 6]) / interData[offset + 7], interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
        return 9;
    }
    /**
     * @private
     */
    parse(data) {
        var reader = new Byte(data);
        this._aniVersion = reader.readUTFString();
        AnimationParser01.parse(this, reader);
    }
    /**
     * @internal
     */
    _calculateKeyFrame(node, keyframeCount, keyframeDataCount) {
        var keyFrames = node.keyFrame;
        keyFrames[keyframeCount] = keyFrames[0];
        for (var i = 0; i < keyframeCount; i++) {
            var keyFrame = keyFrames[i];
            for (var j = 0; j < keyframeDataCount; j++) {
                keyFrame.dData[j] = (keyFrame.duration === 0) ? 0 : (keyFrames[i + 1].data[j] - keyFrame.data[j]) / keyFrame.duration; //末帧dData数据为0
                keyFrame.nextData[j] = keyFrames[i + 1].data[j];
            }
        }
        keyFrames.length--;
    }
    /**
     * @internal
     */
    //TODO:coverage
    _onAsynLoaded(data, propertyParams = null) {
        var reader = new Byte(data);
        this._aniVersion = reader.readUTFString();
        switch (this._aniVersion) {
            case "LAYAANIMATION:02":
                AnimationParser02.parse(this, reader);
                break;
            default:
                AnimationParser01.parse(this, reader);
        }
    }
    getAnimationCount() {
        return this._anis.length;
    }
    getAnimation(aniIndex) {
        return this._anis[aniIndex];
    }
    getAniDuration(aniIndex) {
        return this._anis[aniIndex].playTime;
    }
    //TODO:coverage
    getNodes(aniIndex) {
        return this._anis[aniIndex].nodes;
    }
    getNodeIndexWithName(aniIndex, name) {
        return this._anis[aniIndex].bone3DMap[name];
    }
    getNodeCount(aniIndex) {
        return this._anis[aniIndex].nodes.length;
    }
    getTotalkeyframesLength(aniIndex) {
        return this._anis[aniIndex].totalKeyframeDatasLength;
    }
    getPublicExtData() {
        return this._publicExtData;
    }
    //TODO:coverage
    getAnimationDataWithCache(key, cacheDatas, aniIndex, frameIndex) {
        var aniDatas = cacheDatas[aniIndex];
        if (!aniDatas) {
            return null;
        }
        else {
            var keyDatas = aniDatas[key];
            if (!keyDatas)
                return null;
            else {
                return keyDatas[frameIndex];
            }
        }
    }
    //TODO:coverage
    setAnimationDataWithCache(key, cacheDatas, aniIndex, frameIndex, data) {
        var aniDatas = (cacheDatas[aniIndex]) || (cacheDatas[aniIndex] = {});
        var aniDatasCache = (aniDatas[key]) || (aniDatas[key] = []);
        aniDatasCache[frameIndex] = data;
    }
    /**
     * 计算当前时间应该对应关键帧的哪一帧
     * @param	nodeframes	当前骨骼的关键帧数据
     * @param	nodeid		骨骼id，因为要使用和更新 _boneCurKeyFrm
     * @param	tm
     * @return
     * 问题
     * 	最后一帧有问题，例如倒数第二帧时间是0.033ms,则后两帧非常靠近，当实际给最后一帧的时候，根据帧数计算出的时间实际上落在倒数第二帧
     *  	使用与AnimationPlayer一致的累积时间就行
     */
    getNodeKeyFrame(nodeframes, nodeid, tm) {
        var cid = this._boneCurKeyFrm[nodeid];
        var frmNum = nodeframes.length;
        if (cid == void 0 || cid >= frmNum) {
            cid = this._boneCurKeyFrm[nodeid] = 0;
        }
        var kinfo = nodeframes[cid];
        var curFrmTm = kinfo.startTime;
        var dt = tm - curFrmTm;
        // 缓存命中的情况
        if (dt == 0 || (dt > 0 && kinfo.duration > dt)) {
            return cid;
        }
        // 否则就要前后判断在第几帧
        var i = 0;
        if (dt > 0) {
            // 在后面
            tm = tm + 0.01; // 有个问题，由于浮点精度的问题可能导致 前后 st+duration  st+duration 接不上。导致cid+1的起始时间>tm，所以时间加上一点
            for (i = cid + 1; i < frmNum; i++) {
                kinfo = nodeframes[i];
                if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                    this._boneCurKeyFrm[nodeid] = i;
                    return i;
                }
            }
            return frmNum - 1;
        }
        else {
            // 在前面
            for (i = 0; i < cid; i++) {
                kinfo = nodeframes[i];
                if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                    this._boneCurKeyFrm[nodeid] = i;
                    return i;
                }
            }
            return cid; // 可能误差导致，返回最后一个
        }
        return 0; // 这个怎么做
    }
    /**
     *
     * @param	aniIndex
     * @param	originalData
     * @param	nodesFrameIndices
     * @param	frameIndex
     * @param	playCurTime
     */
    getOriginalData(aniIndex, originalData, nodesFrameIndices, frameIndex, playCurTime) {
        var oneAni = this._anis[aniIndex];
        var nodes = oneAni.nodes;
        // 当前帧缓存数组可能大小需要调整
        var curKFrm = this._boneCurKeyFrm;
        if (curKFrm.length < nodes.length) {
            curKFrm.length = nodes.length;
        }
        //playCurTime %= oneAni.playTime;
        var j = 0;
        for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
            var node = nodes[i];
            var key;
            //key = node.keyFrame[nodesFrameIndices[i][frameIndex]];
            var kfrm = node.keyFrame;
            key = kfrm[this.getNodeKeyFrame(kfrm, i, playCurTime)];
            node.dataOffset = outOfs;
            var dt = playCurTime - key.startTime;
            var lerpType = node.lerpType;
            if (lerpType) {
                switch (lerpType) {
                    case 0:
                    case 1:
                        for (j = 0; j < node.keyframeWidth;)
                            j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                        break;
                    case 2:
                        var interpolationData = key.interpolationData;
                        var interDataLen = interpolationData.length;
                        var dataIndex = 0;
                        for (j = 0; j < interDataLen;) {
                            var type = interpolationData[j];
                            switch (type) {
                                case 6:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                case 7:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                default:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                            }
                            //if (type === 6)
                            //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData.slice(j+1, j + 5));
                            //else
                            //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                            dataIndex++;
                        }
                        break;
                }
            }
            else {
                for (j = 0; j < node.keyframeWidth;)
                    j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
            }
            outOfs += node.keyframeWidth;
        }
    }
    //TODO:coverage
    getNodesCurrentFrameIndex(aniIndex, playCurTime) {
        var ani = this._anis[aniIndex];
        var nodes = ani.nodes;
        if (aniIndex !== this.unfixedLastAniIndex) {
            this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
            this.unfixedCurrentTimes = new Float32Array(nodes.length);
            this.unfixedLastAniIndex = aniIndex;
        }
        for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
            var node = nodes[i];
            if (playCurTime < this.unfixedCurrentTimes[i])
                this.unfixedCurrentFrameIndexes[i] = 0;
            this.unfixedCurrentTimes[i] = playCurTime;
            while ((this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length)) {
                if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
                    break;
                this.unfixedCurrentFrameIndexes[i]++;
            }
            this.unfixedCurrentFrameIndexes[i]--;
        }
        return this.unfixedCurrentFrameIndexes;
    }
    //TODO:coverage
    getOriginalDataUnfixedRate(aniIndex, originalData, playCurTime) {
        var oneAni = this._anis[aniIndex];
        var nodes = oneAni.nodes;
        if (aniIndex !== this.unfixedLastAniIndex) {
            this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
            this.unfixedCurrentTimes = new Float32Array(nodes.length);
            this.unfixedKeyframes = [];
            this.unfixedLastAniIndex = aniIndex;
        }
        var j = 0;
        for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
            var node = nodes[i];
            if (playCurTime < this.unfixedCurrentTimes[i])
                this.unfixedCurrentFrameIndexes[i] = 0;
            this.unfixedCurrentTimes[i] = playCurTime;
            while (this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length) {
                if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
                    break;
                this.unfixedKeyframes[i] = node.keyFrame[this.unfixedCurrentFrameIndexes[i]];
                this.unfixedCurrentFrameIndexes[i]++;
            }
            var key = this.unfixedKeyframes[i];
            node.dataOffset = outOfs;
            var dt = playCurTime - key.startTime;
            var lerpType = node.lerpType;
            if (lerpType) {
                switch (node.lerpType) {
                    case 0:
                    case 1:
                        for (j = 0; j < node.keyframeWidth;)
                            j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                        break;
                    case 2:
                        var interpolationData = key.interpolationData;
                        var interDataLen = interpolationData.length;
                        var dataIndex = 0;
                        for (j = 0; j < interDataLen;) {
                            var type = interpolationData[j];
                            switch (type) {
                                case 6:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                case 7:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                default:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                            }
                            //if (type === 6)
                            //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData.slice(j+1, j + 5));
                            //else
                            //j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                            dataIndex++;
                        }
                        break;
                }
            }
            else {
                for (j = 0; j < node.keyframeWidth;)
                    j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
            }
            outOfs += node.keyframeWidth;
        }
    }
}
AnimationTemplet.interpolation = [AnimationTemplet._LinearInterpolation_0, AnimationTemplet._QuaternionInterpolation_1, AnimationTemplet._AngleInterpolation_2, AnimationTemplet._RadiansInterpolation_3, AnimationTemplet._Matrix4x4Interpolation_4, AnimationTemplet._NoInterpolation_5, AnimationTemplet._BezierInterpolation_6, AnimationTemplet._BezierInterpolation_7];
IAniLib.AnimationTemplet = AnimationTemplet;
