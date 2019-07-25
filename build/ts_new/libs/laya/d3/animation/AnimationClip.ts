import { AnimationClipParser03 } from "./AnimationClipParser03";
import { AnimationClipParser04 } from "./AnimationClipParser04";
import { KeyframeNodeList } from "./KeyframeNodeList";
import { AnimationEvent } from "./AnimationEvent";
import { KeyframeNode } from "./KeyframeNode";
import { FloatKeyframe } from "../core/FloatKeyframe"
import { Keyframe } from "../core/Keyframe"
import { QuaternionKeyframe } from "../core/QuaternionKeyframe"
import { Vector3Keyframe } from "../core/Vector3Keyframe"
import { Quaternion } from "../math/Quaternion"
import { Vector3 } from "../math/Vector3"
import { Vector4 } from "../math/Vector4"
import { Utils3D } from "../utils/Utils3D"
import { LayaGL } from "../../layagl/LayaGL"
import { Resource } from "../../resource/Resource"
import { Byte } from "../../utils/Byte"
import { Handler } from "../../utils/Handler"
import { ILaya } from "../../../ILaya";

/**
 * <code>AnimationClip</code> 类用于动画片段资源。
 */
export class AnimationClip extends Resource {
	/**AnimationClip资源。*/
	static ANIMATIONCLIP: string = "ANIMATIONCLIP";

	/**@internal	*/
	static _tempQuaternion0: Quaternion = new Quaternion();

	/**
	 * @inheritDoc
	 */
	static _parse(data: any, propertyParams: any = null, constructParams: any[] = null): AnimationClip {
		var clip: AnimationClip = new AnimationClip();
		var reader: Byte = new Byte(data);
		var version: string = reader.readUTFString();
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
	static load(url: string, complete: Handler): void {
		ILaya.loader.create(url, complete, null, AnimationClip.ANIMATIONCLIP);
	}

	/**@internal */
	_duration: number;
	/**@internal */
	_frameRate: number;
	/**@internal */
	_nodes: KeyframeNodeList = new KeyframeNodeList();
	/**@internal */
	_nodesDic: any;
	/**@internal */
	_nodesMap: any;//TODO:去掉
	/** @internal */
	_animationEvents: AnimationEvent[];

	/**是否循环。*/
	islooping: boolean;

	/**
	 * 获取动画片段时长。
	 */
	duration(): number {
		return this._duration;
	}

	/**
	 * 创建一个 <code>AnimationClip</code> 实例。
	 */
	constructor() {
		super();
		this._animationEvents = [];
	}

	private _hermiteInterpolate(frame: FloatKeyframe, nextFrame: FloatKeyframe, t: number, dur: number): number {
		var t0: number = frame.outTangent, t1: number = nextFrame.inTangent;
		if (Number.isFinite(t0) && Number.isFinite(t1)) {
			var t2: number = t * t;
			var t3: number = t2 * t;
			var a: number = 2.0 * t3 - 3.0 * t2 + 1.0;
			var b: number = t3 - 2.0 * t2 + t;
			var c: number = t3 - t2;
			var d: number = -2.0 * t3 + 3.0 * t2;
			return a * frame.value + b * t0 * dur + c * t1 * dur + d * nextFrame.value;
		} else
			return frame.value;
	}

	private _hermiteInterpolateVector3(frame: Vector3Keyframe, nextFrame: Vector3Keyframe, t: number, dur: number, out: Vector3): void {
		var p0: Vector3 = frame.value;
		var tan0: Vector3 = frame.outTangent;
		var p1: Vector3 = nextFrame.value;
		var tan1: Vector3 = nextFrame.inTangent;

		var t2: number = t * t;
		var t3: number = t2 * t;
		var a: number = 2.0 * t3 - 3.0 * t2 + 1.0;
		var b: number = t3 - 2.0 * t2 + t;
		var c: number = t3 - t2;
		var d: number = -2.0 * t3 + 3.0 * t2;

		var t0: number = tan0.x, t1: number = tan1.x;
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

	private _hermiteInterpolateQuaternion(frame: QuaternionKeyframe, nextFrame: QuaternionKeyframe, t: number, dur: number, out: Quaternion): void {
		var p0: Quaternion = frame.value;
		var tan0: Vector4 = frame.outTangent;
		var p1: Quaternion = nextFrame.value;
		var tan1: Vector4 = nextFrame.inTangent;

		var t2: number = t * t;
		var t3: number = t2 * t;
		var a: number = 2.0 * t3 - 3.0 * t2 + 1.0;
		var b: number = t3 - 2.0 * t2 + t;
		var c: number = t3 - t2;
		var d: number = -2.0 * t3 + 3.0 * t2;

		var t0: number = tan0.x, t1: number = tan1.x;
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
	 * @internal
	 */
	_evaluateClipDatasRealTime(nodes: KeyframeNodeList, playCurTime: number, realTimeCurrentFrameIndexes: Int16Array, addtive: boolean, frontPlay: boolean): void {
		for (var i: number = 0, n: number = nodes.count; i < n; i++) {
			var node: KeyframeNode = nodes.getNodeByIndex(i);
			var type: number = node.type;
			var nextFrameIndex: number;
			var keyFrames: Keyframe[] = node._keyFrames;
			var keyFramesCount: number = keyFrames.length;
			var frameIndex: number = realTimeCurrentFrameIndexes[i];

			if (frontPlay) {
				if ((frameIndex !== -1) && (playCurTime < keyFrames[frameIndex].time)) {//重置正向循环
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
			} else {
				nextFrameIndex = frameIndex + 1;
				if ((nextFrameIndex !== keyFramesCount) && (playCurTime > keyFrames[nextFrameIndex].time)) {//重置逆向循环
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

			var isEnd: boolean = nextFrameIndex === keyFramesCount;
			switch (type) {
				case 0:
					if (frameIndex !== -1) {
						var frame: FloatKeyframe = (<FloatKeyframe>keyFrames[frameIndex]);
						if (isEnd) {//如果nextFarme为空，不修改数据，保持上一帧
							node.data = frame.value;
						} else {
							var nextFarme: FloatKeyframe = (<FloatKeyframe>keyFrames[nextFrameIndex]);
							var d: number = nextFarme.time - frame.time;
							var t: number;
							if (d !== 0)
								t = (playCurTime - frame.time) / d;
							else
								t = 0;
							node.data = this._hermiteInterpolate(frame, nextFarme, t, d);
						}

					} else {
						node.data = ((<FloatKeyframe>keyFrames[0])).value;
					}

					if (addtive)
						node.data -= ((<FloatKeyframe>keyFrames[0])).value;
					break;
				case 1:
				case 4:
					var clipData: Vector3 = node.data;
					this._evaluateFrameNodeVector3DatasRealTime(keyFrames as Vector3Keyframe[], frameIndex, isEnd, playCurTime, clipData);
					if (addtive) {
						var firstFrameValue: Vector3 = ((<Vector3Keyframe>keyFrames[0])).value;
						clipData.x -= firstFrameValue.x;
						clipData.y -= firstFrameValue.y;
						clipData.z -= firstFrameValue.z;
					}
					break;
				case 2:
					var clipQuat: Quaternion = node.data;
					this._evaluateFrameNodeQuaternionDatasRealTime(keyFrames as QuaternionKeyframe[], frameIndex, isEnd, playCurTime, clipQuat);
					if (addtive) {
						var tempQuat: Quaternion = AnimationClip._tempQuaternion0;
						var firstFrameValueQua: Quaternion = ((<QuaternionKeyframe>keyFrames[0])).value;
						Utils3D.quaternionConjugate(firstFrameValueQua, tempQuat);
						Quaternion.multiply(tempQuat, clipQuat, clipQuat);
					}

					break;
				case 3:
					clipData = node.data;
					this._evaluateFrameNodeVector3DatasRealTime(keyFrames as Vector3Keyframe[], frameIndex, isEnd, playCurTime, clipData);
					if (addtive) {
						firstFrameValue = ((<Vector3Keyframe>keyFrames[0])).value;
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

	_evaluateClipDatasRealTimeForNative(nodes: any, playCurTime: number, realTimeCurrentFrameIndexes: Uint16Array, addtive: boolean): void {
		(<any>LayaGL.instance).evaluateClipDatasRealTime(nodes._nativeObj, playCurTime, realTimeCurrentFrameIndexes, addtive);
	}

	private _evaluateFrameNodeVector3DatasRealTime(keyFrames: Vector3Keyframe[], frameIndex: number, isEnd: boolean, playCurTime: number, outDatas: Vector3): void {
		if (frameIndex !== -1) {
			var frame: Vector3Keyframe = keyFrames[frameIndex];
			if (isEnd) {
				var frameData: Vector3 = frame.value;
				outDatas.x = frameData.x;//不能设为null，会造成跳过当前帧数据
				outDatas.y = frameData.y;
				outDatas.z = frameData.z;
			} else {
				var nextKeyFrame: Vector3Keyframe = keyFrames[frameIndex + 1];
				var t: number;
				var startTime: number = frame.time;
				var d: number = nextKeyFrame.time - startTime;
				if (d !== 0)
					t = (playCurTime - startTime) / d;
				else
					t = 0;

				this._hermiteInterpolateVector3(frame, nextKeyFrame, t, d, outDatas);
			}

		} else {
			var firstFrameDatas: Vector3 = keyFrames[0].value;
			outDatas.x = firstFrameDatas.x;
			outDatas.y = firstFrameDatas.y;
			outDatas.z = firstFrameDatas.z;
		}
	}


	private _evaluateFrameNodeQuaternionDatasRealTime(keyFrames: QuaternionKeyframe[], frameIndex: number, isEnd: boolean, playCurTime: number, outDatas: Quaternion): void {
		if (frameIndex !== -1) {
			var frame: QuaternionKeyframe = keyFrames[frameIndex];
			if (isEnd) {
				var frameData: Quaternion = frame.value;
				outDatas.x = frameData.x;//不能设为null，会造成跳过当前帧数据
				outDatas.y = frameData.y;
				outDatas.z = frameData.z;
				outDatas.w = frameData.w;
			} else {
				var nextKeyFrame: QuaternionKeyframe = keyFrames[frameIndex + 1];
				var t: number;
				var startTime: number = frame.time;
				var d: number = nextKeyFrame.time - startTime;
				if (d !== 0)
					t = (playCurTime - startTime) / d;
				else
					t = 0;

				this._hermiteInterpolateQuaternion(frame, nextKeyFrame, t, d, outDatas);
			}

		} else {
			var firstFrameDatas: Quaternion = keyFrames[0].value;
			outDatas.x = firstFrameDatas.x;
			outDatas.y = firstFrameDatas.y;
			outDatas.z = firstFrameDatas.z;
			outDatas.w = firstFrameDatas.w;
		}
	}

	private _binarySearchEventIndex(time: number): number {
		var start: number = 0;
		var end: number = this._animationEvents.length - 1;
		var mid: number;
		while (start <= end) {
			mid = Math.floor((start + end) / 2);
			var midValue: number = this._animationEvents[mid].time;
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
	addEvent(event: AnimationEvent): void {
		var index: number = this._binarySearchEventIndex(event.time);
		this._animationEvents.splice(index, 0, event);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		this._nodes = null;
		this._nodesMap = null;
	}
}



