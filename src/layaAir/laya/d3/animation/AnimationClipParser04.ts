import { KeyframeNode } from "./KeyframeNode";
import { KeyframeNodeList } from "./KeyframeNodeList";
import { AnimationEvent } from "./AnimationEvent";
import { AnimationClip } from "./AnimationClip";
import { Byte } from "../../utils/Byte";
import { HalfFloatUtils } from "../../utils/HalfFloatUtils";
import { KeyFrameValueType } from "../component/Animator/KeyframeNodeOwner";
import { Quaternion } from "../../maths/Quaternion";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { FloatKeyframe } from "../../maths/FloatKeyframe";
import { WeightedMode } from "../../maths/Keyframe";
import { QuaternionKeyframe } from "../../maths/QuaternionKeyframe";
import { Vector2Keyframe } from "../../maths/Vector2Keyframe";
import { Vector3Keyframe } from "../../maths/Vector3Keyframe";
import { Vector4Keyframe } from "../../maths/Vector4Keyframe";
import { BooleanKeyframe } from "../../maths/BooleanKeyframe";
import { PathPointKeyframe } from "../../maths/PathPointKeyframe";
import { CurvePath } from "../../tween/CurvePath";
import { PathPoint } from "../../tween/PathPoint";

/**
 * @internal
 * @en A tool class for parsing AnimationClip data.
 * @zh 解析AnimationClip数据的工具类。
 */
export class AnimationClipParser04 {
	private static _animationClip: AnimationClip | null;
	private static _reader: Byte | null;
	private static _strings: any[] = [];
	private static _BLOCK: any = { count: 0 };
	private static _DATA: any = { offset: 0, size: 0 };
	private static _version: string | null;

	private static READ_DATA(): void {
		AnimationClipParser04._DATA.offset = AnimationClipParser04._reader!.readUint32();
		AnimationClipParser04._DATA.size = AnimationClipParser04._reader!.readUint32();
	}

	private static READ_BLOCK(): void {
		var count: number = AnimationClipParser04._BLOCK.count = AnimationClipParser04._reader!.readUint16();
		var blockStarts: any[] = AnimationClipParser04._BLOCK.blockStarts = [];
		var blockLengths: any[] = AnimationClipParser04._BLOCK.blockLengths = [];
		for (var i: number = 0; i < count; i++) {
			blockStarts.push(AnimationClipParser04._reader!.readUint32());
			blockLengths.push(AnimationClipParser04._reader!.readUint32());
		}
	}

	private static READ_STRINGS(): void {
		var offset: number = AnimationClipParser04._reader!.readUint32();
		var count: number = AnimationClipParser04._reader!.readUint16();
		var prePos: number = AnimationClipParser04._reader!.pos;
		AnimationClipParser04._reader!.pos = offset + AnimationClipParser04._DATA.offset;

		for (var i: number = 0; i < count; i++)
			AnimationClipParser04._strings[i] = AnimationClipParser04._reader!.readUTFString();
		AnimationClipParser04._reader!.pos = prePos;
	}

	/**
	 * @internal
	 * @en Parse AnimationClip data from a byte stream.
	 * @param clip The AnimationClip object to be populated with parsed data.
	 * @param reader The Byte object containing the animation data to be parsed.
	 * @param version The version string of the animation data format.
	 * @zh 从字节流中解析AnimationClip数据。
	 * @param clip 要填充解析数据的 AnimationClip 对象。
	 * @param reader 包含要解析的动画数据的 Byte 对象。
	 * @param version 动画数据格式的版本字符串。
	 */
	static parse(clip: AnimationClip, reader: Byte, version: string): void {
		AnimationClipParser04._animationClip = clip;
		AnimationClipParser04._reader = reader;
		AnimationClipParser04._version = version;
		AnimationClipParser04.READ_DATA();
		AnimationClipParser04.READ_BLOCK();
		AnimationClipParser04.READ_STRINGS();
		for (var i: number = 0, n: number = AnimationClipParser04._BLOCK.count; i < n; i++) {
			var index: number = reader.readUint16();
			var blockName: string = AnimationClipParser04._strings[index];
			var fn: () => void = (AnimationClipParser04 as any)["READ_" + blockName];
			if (fn == null)
				throw new Error("model file err,no this function:" + index + " " + blockName);
			else
				fn.call(null);
		}
		AnimationClipParser04._version = null;
		AnimationClipParser04._reader = null;
		AnimationClipParser04._animationClip = null;
	}
	static createPathPoints(arr: any[]): PathPoint[] {
		const result: PathPoint[] = [];
		for (var i = 0, len = arr.length; i < len; i++) {
			const data = arr[i];
			const point = new PathPoint();
			point.pos.x = data.pos.x;
			point.pos.y = data.pos.y;
			point.pos.z = data.pos.z;
			point.c1.x = data.c1.x;
			point.c1.y = data.c1.y;
			point.c1.z = data.c1.z;
			point.c2.x = data.c2.x;
			point.c2.y = data.c2.y;
			point.c2.z = data.c2.z;
			point.curve = data.curve;
			point.rotationType = data.rotationType;
			result.push(point);
		}
		return result;
	}
	/**
	 * @internal
	 * @en Parse the various components of the AnimationClip from binary data and assemble them into a complete AnimationClip object for subsequent animation playback and processing.
	 * @zh 从二进制数据中解析出 AnimationClip 的各个组成部分，并将其组装成一个完整的 AnimationClip 对象，以便后续的动画播放和处理。
	 */
	static READ_ANIMATIONS(): void {
		var i: number, j: number;
		var node: KeyframeNode;
		var reader: Byte = AnimationClipParser04._reader!;

		var startTimeTypes: number[] = [];
		var startTimeTypeCount: number = reader.readUint16();
		startTimeTypes.length = startTimeTypeCount;
		for (i = 0; i < startTimeTypeCount; i++)
			startTimeTypes[i] = reader.readFloat32();

		var clip: AnimationClip = AnimationClipParser04._animationClip!;
		clip.name = AnimationClipParser04._strings[reader.readUint16()];
		var clipDur: number = clip._duration = reader.readFloat32();
		clip.islooping = !!reader.readByte();
		clip._frameRate = reader.readInt16();
		var nodeCount: number = reader.readInt16();
		var nodes: KeyframeNodeList = clip._nodes!;
		nodes.count = nodeCount;
		var nodesMap: any = clip._nodesMap = {};
		var nodesDic: any = clip._nodesDic = {};

		for (i = 0; i < nodeCount; i++) {
			node = new KeyframeNode();
			if ("LAYAANIMATION:WEIGHT_05" == AnimationClipParser04._version) {
				if (1 == reader.readByte()) {
					//propertyChangePath,IDE里面还原数据时候使用，引擎中是不需要的
					node.propertyChangePath = AnimationClipParser04._strings[reader.readUint16()];
				}
				if (1 == reader.readByte()) {
					node.callbackFunData = AnimationClipParser04._strings[reader.readUint16()];
				}

				let paramLen = reader.readUint8();
				let callParms: any[] = null;
				for (j = 0; j < paramLen; j++) {
					if (null == callParms) {
						callParms = [];
					}
					callParms.push(AnimationClipParser04._strings[reader.readUint16()]);
				}
				node.callParams = callParms;
			}
			nodes.setNodeByIndex(i, node);
			node._indexInList = i;
			var type: number = node.type = reader.readUint8();

			var pathLength: number = reader.readUint16();
			node._setOwnerPathCount(pathLength);
			for (j = 0; j < pathLength; j++)
				node._setOwnerPathByIndex(j, AnimationClipParser04._strings[reader.readUint16()]);//TODO:如果只有根节点并且为空，是否可以和componentType一样优化。

			var nodePath: string = node._joinOwnerPath("/");
			var mapArray: KeyframeNode[] = nodesMap[nodePath];
			(mapArray) || (nodesMap[nodePath] = mapArray = []);
			mapArray.push(node);

			node.propertyOwner = AnimationClipParser04._strings[reader.readUint16()];

			var propertyLength: number = reader.readUint16();
			node._setPropertyCount(propertyLength);
			for (j = 0; j < propertyLength; j++)
				node._setPropertyByIndex(j, AnimationClipParser04._strings[reader.readUint16()]);

			var fullPath: string = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
			nodesDic[fullPath] = node;
			node.fullPath = fullPath;
			node.nodePath = nodePath;

			var keyframeCount: number = reader.readUint16();
			node._setKeyframeCount(keyframeCount);
			switch (AnimationClipParser04._version) {
				case "LAYAANIMATION:04":
					for (j = 0; j < keyframeCount; j++) {
						switch (type) {
							case KeyFrameValueType.Float:
								var floatKeyframe: FloatKeyframe = new FloatKeyframe();
								node._setKeyframeByIndex(j, floatKeyframe);
								floatKeyframe.time = startTimeTypes[reader.readUint16()];
								floatKeyframe.inTangent = reader.readFloat32();
								floatKeyframe.outTangent = reader.readFloat32();
								floatKeyframe.value = reader.readFloat32();
								break;
							case KeyFrameValueType.Position:
							case KeyFrameValueType.Scale:
							case KeyFrameValueType.RotationEuler:
							case KeyFrameValueType.Vector3:
								var floatArrayKeyframe: Vector3Keyframe = new Vector3Keyframe();
								node._setKeyframeByIndex(j, floatArrayKeyframe);
								floatArrayKeyframe.time = startTimeTypes[reader.readUint16()];
								var inTangent: Vector3 = floatArrayKeyframe.inTangent;
								var outTangent: Vector3 = floatArrayKeyframe.outTangent;
								var value: Vector3 = floatArrayKeyframe.value;
								inTangent.x = reader.readFloat32();
								inTangent.y = reader.readFloat32();
								inTangent.z = reader.readFloat32();
								outTangent.x = reader.readFloat32();
								outTangent.y = reader.readFloat32();
								outTangent.z = reader.readFloat32();
								value.x = reader.readFloat32();
								value.y = reader.readFloat32();
								value.z = reader.readFloat32();
								break;
							case KeyFrameValueType.Rotation:
								var quaternionKeyframe: QuaternionKeyframe = new QuaternionKeyframe();
								node._setKeyframeByIndex(j, quaternionKeyframe);
								quaternionKeyframe.time = startTimeTypes[reader.readUint16()];
								var inTangentQua: Vector4 = quaternionKeyframe.inTangent;
								var outTangentQua: Vector4 = quaternionKeyframe.outTangent;
								var valueQua: Quaternion = quaternionKeyframe.value;
								inTangentQua.x = reader.readFloat32();
								inTangentQua.y = reader.readFloat32();
								inTangentQua.z = reader.readFloat32();
								inTangentQua.w = reader.readFloat32();
								outTangentQua.x = reader.readFloat32();
								outTangentQua.y = reader.readFloat32();
								outTangentQua.z = reader.readFloat32();
								outTangentQua.w = reader.readFloat32();
								valueQua.x = reader.readFloat32();
								valueQua.y = reader.readFloat32();
								valueQua.z = reader.readFloat32();
								valueQua.w = reader.readFloat32();
								break;
							case KeyFrameValueType.Vector2:
								var vec2Keyfram = new Vector2Keyframe();
								node._setKeyframeByIndex(j, vec2Keyfram);
								vec2Keyfram.time = startTimeTypes[reader.readUint16()];
								var inTangentV2: Vector2 = vec2Keyfram.inTangent;
								var outTangentV2: Vector2 = vec2Keyfram.outTangent;
								var valueV2: Vector2 = vec2Keyfram.value;
								inTangentV2.x = reader.readFloat32();
								inTangentV2.y = reader.readFloat32();
								outTangentV2.x = reader.readFloat32();
								outTangentV2.y = reader.readFloat32();
								valueV2.x = reader.readFloat32();
								valueV2.y = reader.readFloat32();
								break;
							case KeyFrameValueType.Vector4:
							case KeyFrameValueType.Color:
								var vec4Keyfram = new Vector4Keyframe();
								node._setKeyframeByIndex(j, vec4Keyfram);
								vec4Keyfram.time = startTimeTypes[reader.readUint16()];
								var inTangentV4: Vector4 = vec4Keyfram.inTangent;
								var outTangentV4: Vector4 = vec4Keyfram.outTangent;
								var valueV4: Vector4 = vec4Keyfram.value;
								inTangentV4.x = reader.readFloat32();
								inTangentV4.y = reader.readFloat32();
								inTangentV4.z = reader.readFloat32();
								inTangentV4.w = reader.readFloat32();
								outTangentV4.x = reader.readFloat32();
								outTangentV4.y = reader.readFloat32();
								outTangentV4.z = reader.readFloat32();
								outTangentV4.w = reader.readFloat32();
								valueV4.x = reader.readFloat32();
								valueV4.y = reader.readFloat32();
								valueV4.z = reader.readFloat32();
								valueV4.w = reader.readFloat32();
								break;
							default:
								throw new Error("AnimationClipParser04:unknown type.");
						}
					}
					break;
				case "LAYAANIMATION:WEIGHT_04":
				case "LAYAANIMATION:WEIGHT_05":
					for (j = 0; j < keyframeCount; j++) {
						let isWeight = 1;
						switch (type) {
							case KeyFrameValueType.PathPoint:
								const pathPointKeyframe = new PathPointKeyframe();
								node._setKeyframeByIndex(j, pathPointKeyframe);
								pathPointKeyframe.time = startTimeTypes[reader.readUint16()];
								const jsonData = JSON.parse(reader.readUTFString());
								const curvePath = new CurvePath();
								pathPointKeyframe.value = curvePath;
								(curvePath as any)._$data = jsonData;
								curvePath.create(...AnimationClipParser04.createPathPoints(jsonData));
								break;
							case KeyFrameValueType.Boolean:
								let booleanKeyframe = new BooleanKeyframe();
								node._setKeyframeByIndex(j, booleanKeyframe);
								booleanKeyframe.time = startTimeTypes[reader.readUint16()];
								booleanKeyframe.value = reader.readByte() == 1;
								break;
							case KeyFrameValueType.Float:
								var floatKeyframe: FloatKeyframe = new FloatKeyframe();
								node._setKeyframeByIndex(j, floatKeyframe);
								floatKeyframe.time = startTimeTypes[reader.readUint16()];
								floatKeyframe.inTangent = reader.readFloat32();
								floatKeyframe.outTangent = reader.readFloat32();
								floatKeyframe.value = reader.readFloat32();
								floatKeyframe.weightedMode = reader.readUint8();
								if ("LAYAANIMATION:WEIGHT_05" == AnimationClipParser04._version) {
									if (WeightedMode.In == floatKeyframe.weightedMode || WeightedMode.Both == floatKeyframe.weightedMode) {
										floatKeyframe.inWeight = reader.readFloat32();
									}
									if (WeightedMode.Out == floatKeyframe.weightedMode || WeightedMode.Both == floatKeyframe.weightedMode) {
										floatKeyframe.outWeight = reader.readFloat32();
									}
								} else {
									floatKeyframe.inWeight = reader.readFloat32();
									floatKeyframe.outWeight = reader.readFloat32();
								}
								break;
							case KeyFrameValueType.Position:
							case KeyFrameValueType.Scale:
							case KeyFrameValueType.RotationEuler:
							case KeyFrameValueType.Vector3:
								var floatArrayKeyframe: Vector3Keyframe = new Vector3Keyframe(true);
								node._setKeyframeByIndex(j, floatArrayKeyframe);
								floatArrayKeyframe.time = startTimeTypes[reader.readUint16()];
								var inTangent: Vector3 = floatArrayKeyframe.inTangent;
								var outTangent: Vector3 = floatArrayKeyframe.outTangent;
								var value: Vector3 = floatArrayKeyframe.value;
								let weidhtMode = floatArrayKeyframe.weightedMode;
								let inWeight = floatArrayKeyframe.inWeight;
								let outWeight = floatArrayKeyframe.outWeight;
								inTangent.x = reader.readFloat32();
								inTangent.y = reader.readFloat32();
								inTangent.z = reader.readFloat32();
								outTangent.x = reader.readFloat32();
								outTangent.y = reader.readFloat32();
								outTangent.z = reader.readFloat32();
								value.x = reader.readFloat32();
								value.y = reader.readFloat32();
								value.z = reader.readFloat32();

								if ("LAYAANIMATION:WEIGHT_05" == AnimationClipParser04._version) {
									isWeight = reader.readByte();
								}
								if (1 == isWeight) {
									weidhtMode.x = reader.readUint8();
									weidhtMode.y = reader.readUint8();
									weidhtMode.z = reader.readUint8();
									inWeight.x = reader.readFloat32();
									inWeight.y = reader.readFloat32();
									inWeight.z = reader.readFloat32();
									outWeight.x = reader.readFloat32();
									outWeight.y = reader.readFloat32();
									outWeight.z = reader.readFloat32();
								}
								break;
							case KeyFrameValueType.Rotation:
								var quaternionKeyframe: QuaternionKeyframe = new QuaternionKeyframe(true);
								node._setKeyframeByIndex(j, quaternionKeyframe);
								quaternionKeyframe.time = startTimeTypes[reader.readUint16()];
								var inTangentQua: Vector4 = quaternionKeyframe.inTangent;
								var outTangentQua: Vector4 = quaternionKeyframe.outTangent;
								var valueQua: Quaternion = quaternionKeyframe.value;
								let weightModeV4 = quaternionKeyframe.weightedMode;
								let inWeightQua = quaternionKeyframe.inWeight;
								let outWeightQua = quaternionKeyframe.outWeight;
								inTangentQua.x = reader.readFloat32();
								inTangentQua.y = reader.readFloat32();
								inTangentQua.z = reader.readFloat32();
								inTangentQua.w = reader.readFloat32();
								outTangentQua.x = reader.readFloat32();
								outTangentQua.y = reader.readFloat32();
								outTangentQua.z = reader.readFloat32();
								outTangentQua.w = reader.readFloat32();
								valueQua.x = reader.readFloat32();
								valueQua.y = reader.readFloat32();
								valueQua.z = reader.readFloat32();
								valueQua.w = reader.readFloat32();

								if ("LAYAANIMATION:WEIGHT_05" == AnimationClipParser04._version) {
									isWeight = reader.readByte();
								}
								if (1 == isWeight) {
									weightModeV4.x = reader.readUint8();
									weightModeV4.y = reader.readUint8();
									weightModeV4.z = reader.readUint8();
									weightModeV4.w = reader.readUint8();
									inWeightQua.x = reader.readFloat32();
									inWeightQua.y = reader.readFloat32();
									inWeightQua.z = reader.readFloat32();
									inWeightQua.w = reader.readFloat32();
									outWeightQua.x = reader.readFloat32();
									outWeightQua.y = reader.readFloat32();
									outWeightQua.z = reader.readFloat32();
									outWeightQua.w = reader.readFloat32();
								}
								break;
							case KeyFrameValueType.Vector2:
								var vec2Keyfram = new Vector2Keyframe(true);
								node._setKeyframeByIndex(j, vec2Keyfram);
								vec2Keyfram.time = startTimeTypes[reader.readUint16()];
								var inTangentV2: Vector2 = vec2Keyfram.inTangent;
								var outTangentV2: Vector2 = vec2Keyfram.outTangent;
								var valueV2: Vector2 = vec2Keyfram.value;
								let weightModeV2 = vec2Keyfram.weightedMode;
								let inWeightV2 = vec2Keyfram.inWeight;
								let outWeightV2 = vec2Keyfram.outWeight;
								inTangentV2.x = reader.readFloat32();
								inTangentV2.y = reader.readFloat32();
								outTangentV2.x = reader.readFloat32();
								outTangentV2.y = reader.readFloat32();
								valueV2.x = reader.readFloat32();
								valueV2.y = reader.readFloat32();
								if ("LAYAANIMATION:WEIGHT_05" == AnimationClipParser04._version) {
									isWeight = reader.readByte();
								}
								if (1 == isWeight) {
									weightModeV2.x = reader.readUint8();
									weightModeV2.y = reader.readUint8();
									inWeightV2.x = reader.readFloat32();
									inWeightV2.y = reader.readFloat32();
									outWeightV2.x = reader.readFloat32();
									outWeightV2.y = reader.readFloat32();
								}
								break;
							case KeyFrameValueType.Vector4:
							case KeyFrameValueType.Color:
								var vec4Keyfram = new Vector4Keyframe(true);
								node._setKeyframeByIndex(j, vec4Keyfram);
								vec4Keyfram.time = startTimeTypes[reader.readUint16()];
								var inTangentV4: Vector4 = vec4Keyfram.inTangent;
								var outTangentV4: Vector4 = vec4Keyfram.outTangent;
								var valueV4: Vector4 = vec4Keyfram.value;
								var weightMode_V4 = vec4Keyfram.weightedMode;
								var inWeightV4 = vec4Keyfram.inWeight;
								var outWeightV4 = vec4Keyfram.outWeight;
								inTangentV4.x = reader.readFloat32();
								inTangentV4.y = reader.readFloat32();
								inTangentV4.z = reader.readFloat32();
								inTangentV4.w = reader.readFloat32();
								outTangentV4.x = reader.readFloat32();
								outTangentV4.y = reader.readFloat32();
								outTangentV4.z = reader.readFloat32();
								outTangentV4.w = reader.readFloat32();
								valueV4.x = reader.readFloat32();
								valueV4.y = reader.readFloat32();
								valueV4.z = reader.readFloat32();
								valueV4.w = reader.readFloat32();
								if ("LAYAANIMATION:WEIGHT_05" == AnimationClipParser04._version) {
									isWeight = reader.readByte();
								}
								if (1 == isWeight) {
									weightMode_V4.x = reader.readUint8();
									weightMode_V4.y = reader.readUint8();
									weightMode_V4.z = reader.readUint8();
									weightMode_V4.w = reader.readUint8();
									inWeightV4.x = reader.readFloat32();
									inWeightV4.y = reader.readFloat32();
									inWeightV4.z = reader.readFloat32();
									inWeightV4.w = reader.readFloat32();
									outWeightV4.x = reader.readFloat32();
									outWeightV4.y = reader.readFloat32();
									outWeightV4.z = reader.readFloat32();
									outWeightV4.w = reader.readFloat32();
								}
								break;
							default:
								throw "AnimationClipParser04:unknown type.";
						}
					}
					break;
				case "LAYAANIMATION:COMPRESSION_04":
					for (j = 0; j < keyframeCount; j++) {
						switch (type) {
							case KeyFrameValueType.Float:
								floatKeyframe = new FloatKeyframe();
								node._setKeyframeByIndex(j, floatKeyframe);
								floatKeyframe.time = startTimeTypes[reader.readUint16()];
								floatKeyframe.inTangent = HalfFloatUtils.convertToNumber(reader.readUint16());
								floatKeyframe.outTangent = HalfFloatUtils.convertToNumber(reader.readUint16());
								floatKeyframe.value = HalfFloatUtils.convertToNumber(reader.readUint16());
								break;
							case KeyFrameValueType.Position:
							case KeyFrameValueType.Scale:
							case KeyFrameValueType.RotationEuler:
							case KeyFrameValueType.Vector3:
								floatArrayKeyframe = new Vector3Keyframe();
								node._setKeyframeByIndex(j, floatArrayKeyframe);
								floatArrayKeyframe.time = startTimeTypes[reader.readUint16()];

								inTangent = floatArrayKeyframe.inTangent;
								outTangent = floatArrayKeyframe.outTangent;
								value = floatArrayKeyframe.value;
								inTangent.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangent.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangent.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangent.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangent.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangent.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								value.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								value.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								value.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								break;
							case KeyFrameValueType.Rotation:
								quaternionKeyframe = new QuaternionKeyframe();
								node._setKeyframeByIndex(j, quaternionKeyframe);
								quaternionKeyframe.time = startTimeTypes[reader.readUint16()];

								inTangentQua = quaternionKeyframe.inTangent;
								outTangentQua = quaternionKeyframe.outTangent;
								valueQua = quaternionKeyframe.value;
								inTangentQua.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangentQua.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangentQua.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangentQua.w = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentQua.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentQua.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentQua.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentQua.w = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueQua.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueQua.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueQua.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueQua.w = HalfFloatUtils.convertToNumber(reader.readUint16());
								break;
							case KeyFrameValueType.Vector2:
								var vec2Keyfram = new Vector2Keyframe();
								node._setKeyframeByIndex(j, vec2Keyfram);
								vec2Keyfram.time = startTimeTypes[reader.readUint16()];
								var inTangentV2: Vector2 = vec2Keyfram.inTangent;
								var outTangentV2: Vector2 = vec2Keyfram.outTangent;
								var valueV2: Vector2 = vec2Keyfram.value;
								inTangentV2.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangentV2.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentV2.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentV2.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueV2.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueV2.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								break;
							case KeyFrameValueType.Vector4:
							case KeyFrameValueType.Color:
								var vec4Keyfram = new Vector4Keyframe();
								node._setKeyframeByIndex(j, vec4Keyfram);
								vec4Keyfram.time = startTimeTypes[reader.readUint16()];
								var inTangentV4: Vector4 = vec4Keyfram.inTangent;
								var outTangentV4: Vector4 = vec4Keyfram.outTangent;
								var valueV4: Vector4 = vec4Keyfram.value;
								inTangentV4.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangentV4.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangentV4.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								inTangentV4.w = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentV4.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentV4.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentV4.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								outTangentV4.w = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueV4.x = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueV4.y = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueV4.z = HalfFloatUtils.convertToNumber(reader.readUint16());
								valueV4.w = HalfFloatUtils.convertToNumber(reader.readUint16());
								break;
							default:
								throw "AnimationClipParser04:unknown type.";
						}
					}
					break;
			}

		}

		var eventCount: number = reader.readUint16();
		for (i = 0; i < eventCount; i++) {
			var event: AnimationEvent = new AnimationEvent();
			event.time = Math.min(clipDur, reader.readFloat32());//TODO:事件时间可能大于动画总时长
			event.eventName = AnimationClipParser04._strings[reader.readUint16()];
			var params: Array<number | string | boolean> = [];
			var paramCount: number = reader.readUint16();
			(paramCount > 0) && (event.params = params = []);

			for (j = 0; j < paramCount; j++) {
				var eventType: number = reader.readByte();
				switch (eventType) {
					case 0:
						params.push(!!reader.readByte());
						break;
					case 1:
						params.push(reader.readInt32());
						break;
					case 2:
						params.push(reader.readFloat32());
						break;
					case 3:
						params.push(AnimationClipParser04._strings[reader.readUint16()]);
						break;
					default:
						throw new Error("unknown type.");
				}
			}
			clip.addEvent(event);
		}
	}
}

