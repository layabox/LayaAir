import { AnimationClipParser03 } from "./AnimationClipParser03";
import { AnimationClipParser04 } from "./AnimationClipParser04";
import { KeyframeNodeList } from "./KeyframeNodeList";
import { AnimationEvent } from "./AnimationEvent";
import { FloatKeyframe } from "../core/FloatKeyframe"
import { QuaternionKeyframe } from "../core/QuaternionKeyframe"
import { Vector3Keyframe } from "../core/Vector3Keyframe"
import { Utils3D } from "../utils/Utils3D"
import { Resource } from "../../resource/Resource"
import { Byte } from "../../utils/Byte"
import { Handler } from "../../utils/Handler"
import { ILaya } from "../../../ILaya";
import { WeightedMode } from "../core/Keyframe";
import { Loader } from "../../net/Loader";
import { Vector2Keyframe } from "../core/Vector2Keyframe";
import { Vector4Keyframe } from "../core/Vector4Keyframe";
import { AvatarMask } from "../component/Animator/AvatarMask";
import { KeyFrameValueType } from "../component/Animator/KeyframeNodeOwner";
import { Quaternion } from "../../maths/Quaternion";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";

/**
 * <code>AnimationClip</code> 类用于动画片段资源。
 */
export class AnimationClip extends Resource {

	/**@internal	*/
	static _tempQuaternion0: Quaternion = new Quaternion();

	/**
	 * @inheritDoc
	 * @internal
	 */
	static _parse(data: any): AnimationClip {
		var clip = new AnimationClip();
		var reader = new Byte(data);
		var version = reader.readUTFString();
		switch (version) {
			case "LAYAANIMATION:03":
				AnimationClipParser03.parse(clip, reader);
				break;
			case "LAYAANIMATION:04":
			case "LAYAANIMATION:COMPRESSION_04":
			case "LAYAANIMATION:WEIGHT_04":
			case "LAYAANIMATION:WEIGHT_05":
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
	 * @param complete  完成回掉。load
	 */
	static load(url: string, complete: Handler): void {
		ILaya.loader.load(url, complete, null, Loader.ANIMATIONCLIP);
	}

	/**@internal */
	_duration: number = 0;
	/**@internal */
	_frameRate: number = 0;
	/**@internal */
	_nodes: KeyframeNodeList | null = new KeyframeNodeList();
	/**@internal */
	_nodesDic: any;
	/**@internal */
	_nodesMap: any;//TODO:去掉
	/** @internal */
	_animationEvents: AnimationEvent[];

	/**是否循环。*/
	islooping: boolean = false;

	/**
	 * 动画持续时间
	 * @returns 返回动画持续时间
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

	/**
	 * 是否是Weight模式
	 * @param weightMode 
	 * @param nextweightMode 
	 * @returns true 此段动画插值使用埃尔米特插值
	 */
	private _weightModeHermite(weightMode: number, nextweightMode: number): boolean {
		return (((weightMode & WeightedMode.Out) == 0) && ((nextweightMode & WeightedMode.In) == 0));
	}



	/**
	 * @internal
	 */
	private _hermiteInterpolate(frame: FloatKeyframe, nextFrame: FloatKeyframe, t: number, dur: number): number {
		var t0 = frame.outTangent, t1 = nextFrame.inTangent;
		if (Number.isFinite(t0) && Number.isFinite(t1)) {
			var t2 = t * t;
			var t3 = t2 * t;
			var a = 2.0 * t3 - 3.0 * t2 + 1.0;
			var b = t3 - 2.0 * t2 + t;
			var c = t3 - t2;
			var d = -2.0 * t3 + 3.0 * t2;
			return a * frame.value + b * t0 * dur + c * t1 * dur + d * nextFrame.value;
		} else
			return frame.value;
	}

	/**
	 * @internal
	 */
	private _hermiteInterpolateVector3(frame: Vector3Keyframe, nextFrame: Vector3Keyframe, t: number, dur: number, out: Vector3): void {
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
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.x, nextFrame.weightedMode.x)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.x = a * p0.x + b * t0 * dur + c * t1 * dur + d * p1.x;
			else
				out.x = p0.x;
		} else {
			out.x = this._hermiteCurveSplineWeight(frame.value.x, frame.time, frame.outWeight.x, frame.outTangent.x,
				nextFrame.value.x, nextFrame.time, nextFrame.inWeight.x, nextFrame.inTangent.x, t);
		}

		t0 = tan0.y, t1 = tan1.y;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.y, nextFrame.weightedMode.y)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.y = a * p0.y + b * t0 * dur + c * t1 * dur + d * p1.y;
			else
				out.y = p0.y;
		} else {
			out.y = this._hermiteCurveSplineWeight(frame.value.y, frame.time, frame.outWeight.y, frame.outTangent.y,
				nextFrame.value.y, nextFrame.time, nextFrame.inWeight.y, nextFrame.inTangent.y, t);
		}

		t0 = tan0.z, t1 = tan1.z;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.z, nextFrame.weightedMode.z)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.z = a * p0.z + b * t0 * dur + c * t1 * dur + d * p1.z;
			else
				out.z = p0.z;
		} else {
			out.z = this._hermiteCurveSplineWeight(frame.value.z, frame.time, frame.outWeight.z, frame.outTangent.z,
				nextFrame.value.z, nextFrame.time, nextFrame.inWeight.z, nextFrame.inTangent.z, t);
		}
	}

	/**
	 * @internal
	 */
	private _hermiteInterpolateQuaternion(frame: QuaternionKeyframe, nextFrame: QuaternionKeyframe, t: number, dur: number, out: Quaternion): void {
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
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.x, nextFrame.weightedMode.x)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.x = a * p0.x + b * t0 * dur + c * t1 * dur + d * p1.x;
			else
				out.x = p0.x;
		} else {
			out.x = this._hermiteCurveSplineWeight(frame.value.x, frame.time, frame.outWeight.x, frame.outTangent.x,
				nextFrame.value.x, nextFrame.time, nextFrame.inWeight.x, nextFrame.inTangent.x, t);
		}


		t0 = tan0.y, t1 = tan1.y;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.y, nextFrame.weightedMode.y)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.y = a * p0.y + b * t0 * dur + c * t1 * dur + d * p1.y;
			else
				out.y = p0.y;
		} else {
			out.y = this._hermiteCurveSplineWeight(frame.value.y, frame.time, frame.outWeight.y, frame.outTangent.y,
				nextFrame.value.y, nextFrame.time, nextFrame.inWeight.y, nextFrame.inTangent.y, t);
		}

		t0 = tan0.z, t1 = tan1.z;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.z, nextFrame.weightedMode.z)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.z = a * p0.z + b * t0 * dur + c * t1 * dur + d * p1.z;
			else
				out.z = p0.z;
		} else {
			out.z = this._hermiteCurveSplineWeight(frame.value.z, frame.time, frame.outWeight.z, frame.outTangent.z,
				nextFrame.value.z, nextFrame.time, nextFrame.inWeight.z, nextFrame.inTangent.z, t);
		}

		t0 = tan0.w, t1 = tan1.w;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.w, nextFrame.weightedMode.w)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.w = a * p0.w + b * t0 * dur + c * t1 * dur + d * p1.w;
			else
				out.w = p0.w;
		} else {
			out.w = this._hermiteCurveSplineWeight(frame.value.w, frame.time, frame.outWeight.w, frame.outTangent.w,
				nextFrame.value.w, nextFrame.time, nextFrame.inWeight.w, nextFrame.inTangent.w, t);
		}
	}

	private _hermiteInterpolateVector4(frame: Vector4Keyframe, nextFrame: Vector4Keyframe, t: number, dur: number, out: Vector4) {
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
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.x, nextFrame.weightedMode.x)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.x = a * p0.x + b * t0 * dur + c * t1 * dur + d * p1.x;
			else
				out.x = p0.x;
		} else {
			out.x = this._hermiteCurveSplineWeight(frame.value.x, frame.time, frame.outWeight.x, frame.outTangent.x,
				nextFrame.value.x, nextFrame.time, nextFrame.inWeight.x, nextFrame.inTangent.x, t);
		}
		t0 = tan0.y, t1 = tan1.y;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.y, nextFrame.weightedMode.y)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.y = a * p0.y + b * t0 * dur + c * t1 * dur + d * p1.y;
			else
				out.y = p0.y;
		} else {
			out.y = this._hermiteCurveSplineWeight(frame.value.y, frame.time, frame.outWeight.y, frame.outTangent.y,
				nextFrame.value.y, nextFrame.time, nextFrame.inWeight.y, nextFrame.inTangent.y, t);
		}

		t0 = tan0.z, t1 = tan1.z;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.z, nextFrame.weightedMode.z)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.z = a * p0.z + b * t0 * dur + c * t1 * dur + d * p1.z;
			else
				out.z = p0.z;
		} else {
			out.z = this._hermiteCurveSplineWeight(frame.value.z, frame.time, frame.outWeight.z, frame.outTangent.z,
				nextFrame.value.z, nextFrame.time, nextFrame.inWeight.z, nextFrame.inTangent.z, t);
		}

		t0 = tan0.w, t1 = tan1.w;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.w, nextFrame.weightedMode.w)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.w = a * p0.w + b * t0 * dur + c * t1 * dur + d * p1.w;
			else
				out.w = p0.w;
		} else {
			out.w = this._hermiteCurveSplineWeight(frame.value.w, frame.time, frame.outWeight.w, frame.outTangent.w,
				nextFrame.value.w, nextFrame.time, nextFrame.inWeight.w, nextFrame.inTangent.w, t);
		}
	}

	private _hermiteInterpolateVector2(frame: Vector2Keyframe, nextFrame: Vector2Keyframe, t: number, dur: number, out: Vector2) {
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
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.x, nextFrame.weightedMode.x)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.x = a * p0.x + b * t0 * dur + c * t1 * dur + d * p1.x;
			else
				out.x = p0.x;
		} else {
			out.x = this._hermiteCurveSplineWeight(frame.value.x, frame.time, frame.outWeight.x, frame.outTangent.x,
				nextFrame.value.x, nextFrame.time, nextFrame.inWeight.x, nextFrame.inTangent.x, t);
		}

		t0 = tan0.y, t1 = tan1.y;
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode.y, nextFrame.weightedMode.y)) {
			if (Number.isFinite(t0) && Number.isFinite(t1))
				out.y = a * p0.y + b * t0 * dur + c * t1 * dur + d * p1.y;
			else
				out.y = p0.y;
		} else {
			out.y = this._hermiteCurveSplineWeight(frame.value.y, frame.time, frame.outWeight.y, frame.outTangent.y,
				nextFrame.value.y, nextFrame.time, nextFrame.inWeight.y, nextFrame.inTangent.y, t);
		}
	}

	private _hermiteCurveSplineWeight(frameValue: number, frametime: number, frameOutWeight: number, frameOutTangent: number, nextframeValue: number, nextframetime: number, nextframeInweight: number, nextframeIntangent: number, time: number) {
		let Eps = 2.22e-16;

		let x = time;
		let x1 = frametime;
		let y1 = frameValue;
		let wt1 = frameOutWeight;
		let x2 = nextframetime;
		let y2 = nextframeValue;
		let wt2 = nextframeInweight;

		let dx = x2 - x1;
		let dy = y2 - y1;
		dy = Math.max(Math.abs(dy), Eps) * (dy < 0 ? -1 : 1);

		let yp1 = frameOutTangent;
		let yp2 = nextframeIntangent;

		if (!Number.isFinite(yp1) || !Number.isFinite(yp2)) {
			return frameValue;
		}

		yp1 = yp1 * dx / dy;
		yp2 = yp2 * dx / dy;

		let wt2s = 1 - wt2;

		let t = 0.5;
		let t2 = 0;

		if (Math.abs(wt1 - 0.33333334) < 0.0001 && Math.abs(wt2 - 0.33333334) < 0.0001) {
			t = x;
			t2 = 1 - t;
		}
		else {
			while (true) {
				t2 = (1 - t);
				let fg = 3 * t2 * t2 * t * wt1 + 3 * t2 * t * t * wt2s + t * t * t - x;
				if (Math.abs(fg) <= 2.5 * Eps)
					break;

				// third order householder method
				let fpg = 3 * t2 * t2 * wt1 + 6 * t2 * t * (wt2s - wt1) + 3 * t * t * (1 - wt2s);
				let fppg = 6 * t2 * (wt2s - 2 * wt1) + 6 * t * (1 - 2 * wt2s + wt1);
				let fpppg = 18 * wt1 - 18 * wt2s + 6;

				t -= (6 * fg * fpg * fpg - 3 * fg * fg * fppg) / (6 * fpg * fpg * fpg - 6 * fg * fpg * fppg + fg * fg * fpppg);
			}
		}

		let y = 3 * t2 * t2 * t * wt1 * yp1 + 3 * t2 * t * t * (1 - wt2 * yp2) + t * t * t;

		return y * dy + y1;
	}

	private _curveInterpolate(frame: FloatKeyframe, nextFrame: FloatKeyframe, t: number, dur: number): number {
		if ((!frame.weightedMode) || this._weightModeHermite(frame.weightedMode, nextFrame.weightedMode)) {
			return this._hermiteInterpolate(frame, nextFrame, t, dur);
		} else {
			//weight
			return this._hermiteCurveSplineWeight(frame.value, frame.time, frame.outWeight, frame.outTangent,
				nextFrame.value, nextFrame.time, nextFrame.inWeight, nextFrame.inTangent, t);
		}

	}

	/**
	 * @internal
	 * @param nodes 动画帧
	 * @param playCurTime 现在的播放时间
	 * @param realTimeCurrentFrameIndexes 目前到达了动画的第几帧
	 * @param addtive 是否是addtive模式
	 * @param frontPlay 是否是前向播放
	 * @param outDatas 计算好的动画数据
	 */
	_evaluateClipDatasRealTime(nodes: KeyframeNodeList, playCurTime: number, realTimeCurrentFrameIndexes: Int16Array, addtive: boolean, frontPlay: boolean, outDatas: Array<number | Vector3 | Quaternion | Vector4 | Vector2>, avatarMask: AvatarMask): void {
		for (var i = 0, n = nodes.count; i < n; i++) {
			var node = nodes.getNodeByIndex(i);
			var type = node.type;
			var nextFrameIndex;
			var keyFrames = node._keyFrames;
			var keyFramesCount = keyFrames.length;
			var frameIndex = realTimeCurrentFrameIndexes[i];
			if (avatarMask && (!avatarMask.getTransformActive(node.nodePath))) {
				continue;
			}
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

			var isEnd = nextFrameIndex === keyFramesCount;
			switch (type) {
				case KeyFrameValueType.Float:
					if (frameIndex !== -1) {
						var frame = (<FloatKeyframe>keyFrames[frameIndex]);
						if (isEnd) {//如果nextFarme为空，不修改数据，保持上一帧
							outDatas[i] = frame.value;
						} else {
							var nextFarme = (<FloatKeyframe>keyFrames[nextFrameIndex]);
							var d = nextFarme.time - frame.time;
							var t;
							if (d !== 0)
								t = (playCurTime - frame.time) / d;
							else
								t = 0;
							outDatas[i] = this._curveInterpolate(frame, nextFarme, t, d);
						}

					} else {
						outDatas[i] = (<FloatKeyframe>keyFrames[0]).value;
					}

					if (addtive)
						outDatas[i] = <number>outDatas[i] - (<FloatKeyframe>keyFrames[0]).value;
					break;
				case KeyFrameValueType.Position:
				case KeyFrameValueType.RotationEuler:
				case KeyFrameValueType.Vector3:
					var clipData = <Vector3>outDatas[i];
					this._evaluateFrameNodeVector3DatasRealTime(keyFrames as Vector3Keyframe[], frameIndex, isEnd, playCurTime, clipData);
					if (addtive) {
						var firstFrameValue = ((<Vector3Keyframe>keyFrames[0])).value;
						clipData.x -= firstFrameValue.x;
						clipData.y -= firstFrameValue.y;
						clipData.z -= firstFrameValue.z;
					}
					break;
				case KeyFrameValueType.Rotation:
					var clipQuat = <Quaternion>outDatas[i];
					this._evaluateFrameNodeQuaternionDatasRealTime(keyFrames as QuaternionKeyframe[], frameIndex, isEnd, playCurTime, clipQuat);
					if (addtive) {
						var tempQuat = AnimationClip._tempQuaternion0;
						var firstFrameValueQua = ((<QuaternionKeyframe>keyFrames[0])).value;
						Utils3D.quaternionConjugate(firstFrameValueQua, tempQuat);
						Quaternion.multiply(tempQuat, clipQuat, clipQuat);
					}

					break;
				case KeyFrameValueType.Scale:
					clipData = <Vector3>outDatas[i];
					this._evaluateFrameNodeVector3DatasRealTime(keyFrames as Vector3Keyframe[], frameIndex, isEnd, playCurTime, clipData);
					if (addtive) {
						firstFrameValue = ((<Vector3Keyframe>keyFrames[0])).value;
						clipData.x /= firstFrameValue.x;
						clipData.y /= firstFrameValue.y;
						clipData.z /= firstFrameValue.z;
					}
					break;
				case KeyFrameValueType.Vector2:
					var v2Data = <Vector2>outDatas[i];
					this._evaluateFrameNodeVector2DatasRealTime(keyFrames as Vector2Keyframe[], frameIndex, isEnd, playCurTime, v2Data);
					if (addtive) {
						var v2FrameValue = ((<Vector2Keyframe>keyFrames[0])).value;
						v2Data.x -= v2FrameValue.x;
						v2Data.y -= v2FrameValue.y;
					}
					break;
				case KeyFrameValueType.Vector4:
				case KeyFrameValueType.Color:
					var v4Data = <Vector4>outDatas[i];
					this._evaluateFrameNodeVector4DatasRealTime(keyFrames as Vector4Keyframe[], frameIndex, isEnd, playCurTime, v4Data);
					if (addtive) {
						var v4FrameValue = ((<Vector4Keyframe>keyFrames[0])).value;
						v4Data.x -= v4FrameValue.x;
						v4Data.y -= v4FrameValue.y;
						v4Data.z -= v4FrameValue.z;
						v4Data.w -= v4FrameValue.w;
					}
					break;
					break;
				default:
					throw "AnimationClip:unknown node type.";
			}
		}
	}

	private _evaluateFrameNodeVector3DatasRealTime(keyFrames: Vector3Keyframe[], frameIndex: number, isEnd: boolean, playCurTime: number, outDatas: Vector3): void {
		if (frameIndex !== -1) {
			var frame = keyFrames[frameIndex];
			if (isEnd) {
				var frameData = frame.value;
				outDatas.x = frameData.x;//不能设为null，会造成跳过当前帧数据
				outDatas.y = frameData.y;
				outDatas.z = frameData.z;
			} else {
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

		} else {
			var firstFrameDatas = keyFrames[0].value;
			outDatas.x = firstFrameDatas.x;
			outDatas.y = firstFrameDatas.y;
			outDatas.z = firstFrameDatas.z;
		}
	}

	private _evaluateFrameNodeVector2DatasRealTime(keyFrames: Vector2Keyframe[], frameIndex: number, isEnd: boolean, playCurTime: number, outDatas: Vector2): void {
		if (frameIndex !== -1) {
			var frame = keyFrames[frameIndex];
			if (isEnd) {
				var frameData = frame.value;
				outDatas.x = frameData.x;//不能设为null，会造成跳过当前帧数据
				outDatas.y = frameData.y;
			} else {
				var nextKeyFrame = keyFrames[frameIndex + 1];
				var t;
				var startTime = frame.time;
				var d = nextKeyFrame.time - startTime;
				if (d !== 0)
					t = (playCurTime - startTime) / d;
				else
					t = 0;

				this._hermiteInterpolateVector2(frame, nextKeyFrame, t, d, outDatas);
			}

		} else {
			var firstFrameDatas = keyFrames[0].value;
			outDatas.x = firstFrameDatas.x;
			outDatas.y = firstFrameDatas.y;
		}
	}

	private _evaluateFrameNodeVector4DatasRealTime(keyFrames: Vector4Keyframe[], frameIndex: number, isEnd: boolean, playCurTime: number, outDatas: Vector4): void {
		if (frameIndex !== -1) {
			var frame = keyFrames[frameIndex];
			if (isEnd) {
				var frameData = frame.value;
				outDatas.x = frameData.x;//不能设为null，会造成跳过当前帧数据
				outDatas.y = frameData.y;
				outDatas.z = frameData.z;
			} else {
				var nextKeyFrame = keyFrames[frameIndex + 1];
				var t;
				var startTime = frame.time;
				var d = nextKeyFrame.time - startTime;
				if (d !== 0)
					t = (playCurTime - startTime) / d;
				else
					t = 0;

				this._hermiteInterpolateVector4(frame, nextKeyFrame, t, d, outDatas);
			}

		} else {
			var firstFrameDatas = keyFrames[0].value;
			outDatas.x = firstFrameDatas.x;
			outDatas.y = firstFrameDatas.y;
			outDatas.z = firstFrameDatas.z;
		}
	}


	private _evaluateFrameNodeQuaternionDatasRealTime(keyFrames: QuaternionKeyframe[], frameIndex: number, isEnd: boolean, playCurTime: number, outDatas: Quaternion): void {
		if (frameIndex !== -1) {
			var frame = keyFrames[frameIndex];
			if (isEnd) {
				var frameData = frame.value;
				outDatas.x = frameData.x;//不能设为null，会造成跳过当前帧数据
				outDatas.y = frameData.y;
				outDatas.z = frameData.z;
				outDatas.w = frameData.w;
			} else {
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

		} else {
			var firstFrameDatas = keyFrames[0].value;
			outDatas.x = firstFrameDatas.x;
			outDatas.y = firstFrameDatas.y;
			outDatas.z = firstFrameDatas.z;
			outDatas.w = firstFrameDatas.w;
		}
	}

	private _binarySearchEventIndex(time: number): number {
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
	 * @param event 动画事件
	 */
	addEvent(event: AnimationEvent): void {
		var index = this._binarySearchEventIndex(event.time);
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



