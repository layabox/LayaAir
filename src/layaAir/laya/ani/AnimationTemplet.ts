import { AnimationNodeContent } from "./AnimationNodeContent";
import { AnimationContent } from "./AnimationContent";
import { KeyFramesContent } from "./KeyFramesContent";
import { AnimationParser01 } from "./AnimationParser01";
import { AnimationParser02 } from "./AnimationParser02";
import { Resource } from "../resource/Resource";
import { MathUtil } from "../maths/MathUtil";
import { IAniLib } from "./AniLibPack";
import { Byte } from "../utils/Byte";
import { BezierLerp } from "./math/BezierLerp";

/**
 * @en The AnimationTemplate class is used for animation template resources.
 * @zh AnimationTemplet类用于动画模板资源。
 */
export class AnimationTemplet extends Resource {
    /**
     * @en Interpolation function
     * @zh 插值函数
     */
    static interpolation: any[] = [AnimationTemplet._LinearInterpolation_0, AnimationTemplet._QuaternionInterpolation_1, AnimationTemplet._AngleInterpolation_2, AnimationTemplet._RadiansInterpolation_3, AnimationTemplet._Matrix4x4Interpolation_4, AnimationTemplet._NoInterpolation_5, AnimationTemplet._BezierInterpolation_6, AnimationTemplet._BezierInterpolation_7];

    /**
     * @private
     */
    //TODO:coverage
    private static _LinearInterpolation_0(bone: AnimationNodeContent, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null): number {
        out[outOfs] = data[index] + dt * dData[index];
        return 1;
    }

    /**
     * @private
     */
    //TODO:coverage
    private static _QuaternionInterpolation_1(bone: any, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null): number {
        var amount: number = duration === 0 ? 0 : dt / duration;
        MathUtil.slerpQuaternionArray(data, index, nextData, index, amount, out, outOfs);//(dt/duration)为amount比例
        return 4;
    }

    /**
     * @private
     */
    //TODO:coverage
    private static _AngleInterpolation_2(bone: AnimationNodeContent, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null): number {
        return 0;
    }

    /**
     * @private
     */
    //TODO:coverage
    private static _RadiansInterpolation_3(bone: AnimationNodeContent, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null): number {
        return 0;
    }

    /**
     * @private
     */
    //TODO:coverage
    private static _Matrix4x4Interpolation_4(bone: any, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null): number {
        for (let i = 0; i < 16; i++, index++)
            out[outOfs + i] = data[index] + dt * dData[index];
        return 16;
    }

    /**
     * @private
     */
    //TODO:coverage
    private static _NoInterpolation_5(bone: AnimationNodeContent, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null): number {
        out[outOfs] = data[index];
        return 1;
    }

    /**
     * @private
     */
    //TODO:coverage
    private static _BezierInterpolation_6(bone: AnimationNodeContent, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null, offset: number = 0): number {
        out[outOfs] = data[index] + (nextData[index] - data[index]) * BezierLerp.getBezierRate(dt / duration, interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
        return 5;
    }

    /**
     * @private
     */
    //TODO:coverage
    private static _BezierInterpolation_7(bone: AnimationNodeContent, index: number, out: Float32Array, outOfs: number, data: Float32Array, dt: number, dData: Float32Array, duration: number, nextData: Float32Array, interData: any[] = null, offset: number = 0): number {
        //interData=[x0,y0,x1,y1,start,d,offTime,allTime]
        out[outOfs] = interData[offset + 4] + interData[offset + 5] * BezierLerp.getBezierRate((dt * 0.001 + interData[offset + 6]) / interData[offset + 7], interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
        return 9;
    }

    /**
     * 加载动画模板。
     * @param url 动画模板地址。
     */
    //TODO:coverage
    //public static function load(url_load:String):AnimationTemplet {
    //return Laya.loader.create(url, null, null, AnimationTemplet);
    //}

    /**@internal */
    _aniVersion: string;
    /**@internal */
    _anis: AnimationContent[] = [];
    /**@internal */
    _aniMap: any = {};
    /**
     * @internal
     * @en Public Extended Data
     * @zh 公共扩展数据
     */
    _publicExtData: ArrayBuffer;
    /**
     * @internal 
     * @en Whether to use object tree data format
     * @zh 是否采用对象树数据格式
     */
    _useParent: boolean;
    /**@private */
    protected unfixedCurrentFrameIndexes: Uint32Array;
    /**@private */
    protected unfixedCurrentTimes: Float32Array;
    /**@private */
    protected unfixedKeyframes: KeyFramesContent[];
    /**@private */
    protected unfixedLastAniIndex: number = -1;
    /**@internal */
    _aniClassName: string;
    /**@internal */
    _animationDatasCache: any;
    /**@internal */
    _fullFrames: any[] = null;

    /**@private 
     * 记录每个骨骼当前在动画的第几帧。这个是为了去掉缓存的帧索引数据。
    */
    private _boneCurKeyFrm: any[] = [];	// TODO 其实这个应该放到skeleton中

    constructor() {
        super();
    }

    /**
     * @internal
     */
    _calculateKeyFrame(node: AnimationNodeContent, keyframeCount: number, keyframeDataCount: number): void {
        var keyFrames: KeyFramesContent[] = node.keyFrame;
        keyFrames[keyframeCount] = keyFrames[0];
        for (var i: number = 0; i < keyframeCount; i++) {
            var keyFrame: KeyFramesContent = keyFrames[i];
            for (var j: number = 0; j < keyframeDataCount; j++) {
                keyFrame.dData[j] = (keyFrame.duration === 0) ? 0 : (keyFrames[i + 1].data[j] - keyFrame.data[j]) / keyFrame.duration;//末帧dData数据为0
                keyFrame.nextData[j] = keyFrames[i + 1].data[j];
            }
        }
        keyFrames.length--;
    }

    /**
     * @internal
     */
    //TODO:coverage
    _onAsynLoaded(data: any, propertyParams: any = null): void {
        var reader: Byte = new Byte(data);
        this._aniVersion = reader.readUTFString();
        switch (this._aniVersion) {
            case "LAYAANIMATION:02":
                AnimationParser02.parse(this, reader);
                break;
            default:
                AnimationParser01.parse(this, reader);
        }
    }

    /**
     * @en Get the number of animations.
     * @zh 获取动画的数量。
     */
    getAnimationCount(): number {
        return this._anis.length;
    }

    /**
     * @en Retrieve an animation by its index.
     * @param aniIndex The index of the animation to retrieve.
     * @zh 通过索引获取动画。
     * @param aniIndex 要获取的动画的索引。
     */
    getAnimation(aniIndex: number): any {
        return this._anis[aniIndex];
    }

    /**
     * @en Get the duration of an animation.
     * @param aniIndex The index of the animation to check.
     * @zh 获取动画时长。
     * @param aniIndex 要检查的动画的索引。
     */
    getAniDuration(aniIndex: number): number {
        return this._anis[aniIndex].playTime;
    }

    //TODO:coverage
    /**
     * @en Get information about the nodes involved in an animation.
     * @param aniIndex The index of the animation.
     * @zh 获取动画的nodes信息。
     * @param aniIndex 指定动画的索引。
     */
    getNodes(aniIndex: number): any {
        return this._anis[aniIndex].nodes;
    }

    /**
     * @en Retrieve the index of a bone by its name within an animation.
     * @param aniIndex The index of the animation.
     * @param name The name of the bone to retrieve.
     * @returns The index of the bone.
     * @zh 通过名称获取动画中的骨骼索引。
     * @param aniIndex 动画的索引。
     * @param name 要检索的骨骼名称。
     * @returns 骨骼的索引。
     */
    getNodeIndexWithName(aniIndex: number, name: string): number {
        return this._anis[aniIndex].bone3DMap[name];
    }

    /**
     * @en Get the count of nodes in an animation.
     * @param aniIndex The index of the animation.
     * @returns The number of nodes in the animation.
     * @zh 获取动画中的nodes数量。
     * @param aniIndex 动画的索引。
     * @returns 动画中的nodes数量。
     */
    getNodeCount(aniIndex: number): number {
        return this._anis[aniIndex].nodes.length;
    }

    /**
     * @en Get the total length of keyframes in an animation.
     * @param aniIndex The index of the animation.
     * @returns The total number of keyframes.
     * @zh 获取动画关键帧长度。
     * @param aniIndex 动画的索引。
     * @returns 动画关键帧总数。
     */
    getTotalkeyframesLength(aniIndex: number): number {
        return this._anis[aniIndex].totalKeyframeDatasLength;
    }

    /**
     * @en Get the public extension data associated with the animation.
     * @returns The ArrayBuffer containing the public extension data.
     * @zh 获取动画的附加数据。
     * @returns 包含附加数据的ArrayBuffer。
     */
    getPublicExtData(): ArrayBuffer {
        return this._publicExtData;
    }

    //TODO:coverage
    /**
     * @en Retrieve animation data with caching mechanism.
     * @param key The key associated with the data to retrieve.
     * @param cacheDatas The cache data storage.
     * @param aniIndex The index of the animation.
     * @param frameIndex The index of the frame to retrieve data from.
     * @returns The Float32Array containing the animation data, or null if not found.
     * @zh 使用缓存机制获取动画数据。
     * @param key 与要检索的数据关联的键。
     * @param cacheDatas 缓存数据存储。
     * @param aniIndex 动画的索引。
     * @param frameIndex 要检索数据的帧索引。
     * @returns 包含动画数据的Float32Array，如果未找到则返回null。
     */
    getAnimationDataWithCache(key: any, cacheDatas: any, aniIndex: number, frameIndex: number): Float32Array {
        var aniDatas: any = cacheDatas[aniIndex];
        if (!aniDatas) {
            return null;
        } else {
            var keyDatas: any[] = aniDatas[key];
            if (!keyDatas)
                return null;
            else {
                return keyDatas[frameIndex];
            }
        }
    }

    //TODO:coverage
    /**
     * @en Set animation data with caching mechanism.
     * @param key The key associated with the data to set.
     * @param cacheDatas The array of cache data storages.
     * @param aniIndex The index of the animation.
     * @param frameIndex The index of the frame to set data to.
     * @param data The data to set.
     * @zh 设置动画数据并使用缓存机制。
     * @param key 与要设置的数据关联的键。
     * @param cacheDatas 缓存数据存储数组。
     * @param aniIndex 动画的索引。
     * @param frameIndex 要设置数据的帧索引。
     * @param data 要设置的数据。
     */
    setAnimationDataWithCache(key: any, cacheDatas: any[], aniIndex: number, frameIndex: number, data: any): void {
        var aniDatas: any = (cacheDatas[aniIndex]) || (cacheDatas[aniIndex] = {});
        var aniDatasCache: any[] = (aniDatas[key]) || (aniDatas[key] = []);
        aniDatasCache[frameIndex] = data;
    }

    /**
     * @en Calculate which keyframe corresponds to the current time.
     * @param nodeframes The keyframe data for the current bone.
     * @param nodeid The bone ID, used for updating the _boneCurKeyFrm.
     * @param tm The current time in the animation.
     * @returns The index of the keyframe that corresponds to the current time.
     * @note 
     * There is an issue with the last frame. For example, if the time of the second to last frame is 0.033ms,
     * the next two frames are very close together. When the actual last frame is given, the time calculated
     * based on the frame number actually falls on the second to last frame. 
     * Using accumulated time consistent with AnimationPlayer will resolve this issue.
     * @zh 计算当前时间应该对应关键帧的哪一帧。
     * @param nodeframes 当前骨骼的关键帧数据。
     * @param nodeid 骨骼ID，用于更新 _boneCurKeyFrm。
     * @param tm 当前动画的时间。
     * @returns 对应当前时间的关键帧的索引。
     * @note
     * 	最后一帧有问题，例如倒数第二帧时间是0.033ms,则后两帧非常靠近，当实际给最后一帧的时候，根据帧数计算出的时间实际上落在倒数第二帧
     *  	使用与AnimationPlayer一致的累积时间就行
     */
    getNodeKeyFrame(nodeframes: KeyFramesContent[], nodeid: number, tm: number): number {
        var cid: any = this._boneCurKeyFrm[nodeid];
        var frmNum: number = nodeframes.length;

        if (cid == void 0 || cid >= frmNum) {
            cid = this._boneCurKeyFrm[nodeid] = 0;
        }

        var kinfo: KeyFramesContent = nodeframes[cid];

        var curFrmTm: number = kinfo.startTime;
        var dt: number = tm - curFrmTm;
        // 缓存命中的情况
        if (dt == 0 || (dt > 0 && kinfo.duration > dt)) {
            return cid;
        }
        // 否则就要前后判断在第几帧
        var i: number = 0;
        if (dt > 0) {
            // 在后面
            tm = tm + 0.01;// 有个问题，由于浮点精度的问题可能导致 前后 st+duration  st+duration 接不上。导致cid+1的起始时间>tm，所以时间加上一点
            for (i = cid + 1; i < frmNum; i++) {
                kinfo = nodeframes[i];
                if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                    this._boneCurKeyFrm[nodeid] = i;
                    return i;
                }
            }
            return frmNum - 1;
        } else {
            // 在前面
            for (i = 0; i < cid; i++) {
                kinfo = nodeframes[i];
                if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                    this._boneCurKeyFrm[nodeid] = i;
                    return i;
                }
            }
            return cid;	// 可能误差导致，返回最后一个
        }
    }

    /**
     * @en Retrieve and fill the original animation data for a specific frame and time.
     * @param aniIndex The index of the animation.
     * @param originalData A Float32Array to be filled with the retrieved animation data. This array is modified in-place.
     * @param nodesFrameIndices An array containing frame indices for each node (Note: This parameter is not used in the current implementation).
     * @param frameIndex The index of the frame to retrieve data for (Note: This parameter is not used in the current implementation).
     * @param playCurTime The current play time in the animation (in milliseconds).
     * @zh 获取并填充特定帧和时间的原始动画数据。
     * @param aniIndex 动画的索引。
     * @param originalData 用于存储检索到的动画数据的Float32Array。此数组会被直接修改。
     * @param nodesFrameIndices 包含每个节点的帧索引的数组（注意：当前实现中已删除此参数，为保持旧版本兼容而保留）。
     * @param frameIndex 要获取数据的帧索引（注意：当前实现中已删除此参数，为保持旧版本兼容而保留）。
     * @param playCurTime 动画的当前播放时间（毫秒）。
     */
    getOriginalData(aniIndex: number, originalData: Float32Array, nodesFrameIndices: any[], frameIndex: number, playCurTime: number): void {
        var oneAni: AnimationContent = this._anis[aniIndex];

        var nodes: AnimationNodeContent[] = oneAni.nodes;

        // 当前帧缓存数组可能大小需要调整
        var curKFrm: any[] = this._boneCurKeyFrm;
        if (curKFrm.length < nodes.length) {
            curKFrm.length = nodes.length;
        }
        //playCurTime %= oneAni.playTime;
        var j: number = 0;
        for (var i: number = 0, n: number = nodes.length, outOfs: number = 0; i < n; i++) {
            var node: AnimationNodeContent = nodes[i];

            var key: KeyFramesContent;
            //key = node.keyFrame[nodesFrameIndices[i][frameIndex]];
            var kfrm: KeyFramesContent[] = node.keyFrame;
            key = kfrm[this.getNodeKeyFrame(kfrm, i, playCurTime)];

            node.dataOffset = outOfs;

            var dt: number = playCurTime - key.startTime;

            var lerpType: number = node.lerpType;
            if (lerpType) {
                switch (lerpType) {
                    case 0:
                    case 1:
                        for (j = 0; j < node.keyframeWidth;)
                            j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                        break;
                    case 2:
                        var interpolationData: any[] = key.interpolationData;
                        var interDataLen: number = interpolationData.length;
                        var dataIndex: number = 0;
                        for (j = 0; j < interDataLen;) {
                            var type: number = interpolationData[j];
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
            } else {
                for (j = 0; j < node.keyframeWidth;)
                    j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
            }

            outOfs += node.keyframeWidth;
        }
    }

    //TODO:coverage
    /**
     * @en Get the current frame index for each node in the specified animation.
     * @param aniIndex The index of the animation to retrieve node information from.
     * @param playCurTime The current play time of the animation in milliseconds.
     * @returns A Uint32Array containing the current frame index for each node.
     * @zh 获取指定动画中每个节点的当前帧索引。
     * @param aniIndex 要检索节点信息的动画索引。
     * @param playCurTime 动画的当前播放时间（毫秒）。
     * @returns 包含每个节点当前帧索引的Uint32Array。
     */
    getNodesCurrentFrameIndex(aniIndex: number, playCurTime: number): Uint32Array {
        var ani: AnimationContent = this._anis[aniIndex];
        var nodes: AnimationNodeContent[] = ani.nodes;

        if (aniIndex !== this.unfixedLastAniIndex) {
            this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
            this.unfixedCurrentTimes = new Float32Array(nodes.length);
            this.unfixedLastAniIndex = aniIndex;
        }

        for (var i = 0, n = nodes.length; i < n; i++) {
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
    /**
     * @en Retrieve and fill the original animation data at a specific time for the given animation.
     * @param aniIndex The index of the animation to retrieve data from.
     * @param originalData A Float32Array to be filled with the retrieved animation data. This array is modified in-place.
     * @param playCurTime The current play time of the animation in milliseconds.
     * @zh 获取并填充指定动画在特定时间的原始动画数据。
     * @param aniIndex 要检索数据的动画索引。
     * @param originalData 用于存储检索到的动画数据的Float32Array。此数组会被直接修改。
     * @param playCurTime 动画的当前播放时间（毫秒）。
     */
    getOriginalDataUnfixedRate(aniIndex: number, originalData: Float32Array, playCurTime: number): void {
        var oneAni: AnimationContent = this._anis[aniIndex];

        var nodes: AnimationNodeContent[] = oneAni.nodes;

        if (aniIndex !== this.unfixedLastAniIndex) {
            this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
            this.unfixedCurrentTimes = new Float32Array(nodes.length);
            this.unfixedKeyframes = [];
            this.unfixedLastAniIndex = aniIndex;
        }

        var j: number = 0;
        for (var i: number = 0, n: number = nodes.length, outOfs: number = 0; i < n; i++) {
            var node: AnimationNodeContent = nodes[i];

            if (playCurTime < this.unfixedCurrentTimes[i])
                this.unfixedCurrentFrameIndexes[i] = 0;

            this.unfixedCurrentTimes[i] = playCurTime;

            while (this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length) {
                if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
                    break;

                this.unfixedKeyframes[i] = node.keyFrame[this.unfixedCurrentFrameIndexes[i]];
                this.unfixedCurrentFrameIndexes[i]++;
            }

            var key: KeyFramesContent = this.unfixedKeyframes[i];
            node.dataOffset = outOfs;
            var dt: number = playCurTime - key.startTime;
            var lerpType: number = node.lerpType;
            if (lerpType) {
                switch (node.lerpType) {
                    case 0:
                    case 1:
                        for (j = 0; j < node.keyframeWidth;)
                            j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                        break;
                    case 2:
                        var interpolationData: any[] = key.interpolationData;
                        var interDataLen: number = interpolationData.length;
                        var dataIndex: number = 0;
                        for (j = 0; j < interDataLen;) {
                            var type: number = interpolationData[j];
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
            } else {
                for (j = 0; j < node.keyframeWidth;)
                    j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
            }

            outOfs += node.keyframeWidth;
        }
    }
}

IAniLib.AnimationTemplet = AnimationTemplet;