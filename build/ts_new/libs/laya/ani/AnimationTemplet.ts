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
 * <code>AnimationTemplet</code> 类用于动画模板资源。
 */
export class AnimationTemplet extends Resource {
	/**插值函数 */
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
		for (var i: number = 0; i < 16; i++ , index++)
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
	/**@internal */
	_publicExtData: ArrayBuffer;//公共扩展数据
	/**@internal */
	_useParent: boolean;//是否采用对象树数据格式
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

	/**@private */
	private _boneCurKeyFrm: any[] = [];	// 记录每个骨骼当前在动画的第几帧。这个是为了去掉缓存的帧索引数据。TODO 其实这个应该放到skeleton中

	constructor() {
		super();

	}

	/**
	 * @private
	 */
	parse(data: ArrayBuffer): void {//兼容函数
		var reader: Byte = new Byte(data);
		this._aniVersion = reader.readUTFString();
		AnimationParser01.parse(this, reader);
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
	 * 获取动画数量
	 */
	getAnimationCount(): number {
		return this._anis.length;
	}

	/**
	 * 通过索引获取动画
	 * @param aniIndex 
	 */
	getAnimation(aniIndex: number): any {
		return this._anis[aniIndex];
	}

	/**
	 * 获取动画时长
	 * @param aniIndex 
	 */
	getAniDuration(aniIndex: number): number {
		return this._anis[aniIndex].playTime;
	}

	//TODO:coverage
	/**获取动画nodes信息 */
	getNodes(aniIndex: number): any {
		return this._anis[aniIndex].nodes;
	}

	/**获取动画骨骼信息 */
	getNodeIndexWithName(aniIndex: number, name: string): number {
		return this._anis[aniIndex].bone3DMap[name];
	}

	/**获取nodes长度 */
	getNodeCount(aniIndex: number): number {
		return this._anis[aniIndex].nodes.length;
	}

	/**获取keyframes长度 */
	getTotalkeyframesLength(aniIndex: number): number {
		return this._anis[aniIndex].totalKeyframeDatasLength;
	}

	/**获取附加数据 */
	getPublicExtData(): ArrayBuffer {
		return this._publicExtData;
	}

	//TODO:coverage
	/**获取动画信息数据 */
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
	/**设置动画信息数据 */
	setAnimationDataWithCache(key: any, cacheDatas: any[], aniIndex: number, frameIndex: number, data: any): void {
		var aniDatas: any = (cacheDatas[aniIndex]) || (cacheDatas[aniIndex] = {});
		var aniDatasCache: any[] = (aniDatas[key]) || (aniDatas[key] = []);
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
		return 0;	// 这个怎么做
	}

	/**
	 * 获取原始数据
	 * @param	aniIndex
	 * @param	originalData
	 * @param	nodesFrameIndices
	 * @param	frameIndex
	 * @param	playCurTime
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
	/**获取nodes信息 */
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
	/**获取原始数据 */
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