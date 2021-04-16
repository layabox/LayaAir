import { KeyframeNode } from "./KeyframeNode";
import { KeyframeNodeList } from "./KeyframeNodeList";
import { AnimationEvent } from "./AnimationEvent";
import { FloatKeyframe } from "../core/FloatKeyframe"
import { QuaternionKeyframe } from "../core/QuaternionKeyframe"
import { Vector3Keyframe } from "../core/Vector3Keyframe"
import { Quaternion } from "../math/Quaternion"
import { Vector3 } from "../math/Vector3"
import { Vector4 } from "../math/Vector4"
import { AnimationClip } from "./AnimationClip";
import { Byte } from "../../utils/Byte";
import { HalfFloatUtils } from "../../utils/HalfFloatUtils";

/**
 * @internal
 */
export class AnimationClipParser04 {
	private static _animationClip: AnimationClip|null;
	private static _reader: Byte|null;
	private static _strings: any[] = [];
	private static _BLOCK: any = { count: 0 };
	private static _DATA: any = { offset: 0, size: 0 };
	private static _version: string|null;

	private static READ_DATA(): void {
		AnimationClipParser04._DATA.offset = AnimationClipParser04._reader!.getUint32();
		AnimationClipParser04._DATA.size = AnimationClipParser04._reader!.getUint32();
	}

	private static READ_BLOCK(): void {
		var count: number = AnimationClipParser04._BLOCK.count = AnimationClipParser04._reader!.getUint16();
		var blockStarts: any[] = AnimationClipParser04._BLOCK.blockStarts = [];
		var blockLengths: any[] = AnimationClipParser04._BLOCK.blockLengths = [];
		for (var i: number = 0; i < count; i++) {
			blockStarts.push(AnimationClipParser04._reader!.getUint32());
			blockLengths.push(AnimationClipParser04._reader!.getUint32());
		}
	}

	private static READ_STRINGS(): void {
		var offset: number = AnimationClipParser04._reader!.getUint32();
		var count: number = AnimationClipParser04._reader!.getUint16();
		var prePos: number = AnimationClipParser04._reader!.pos;
		AnimationClipParser04._reader!.pos = offset + AnimationClipParser04._DATA.offset;

		for (var i: number = 0; i < count; i++)
			AnimationClipParser04._strings[i] = AnimationClipParser04._reader!.readUTFString();
		AnimationClipParser04._reader!.pos = prePos;
	}

	/**
	 * @internal
	 */
	static parse(clip: AnimationClip, reader: Byte, version: string): void {
		AnimationClipParser04._animationClip = clip;
		AnimationClipParser04._reader = reader;
		AnimationClipParser04._version = version;
		AnimationClipParser04.READ_DATA();
		AnimationClipParser04.READ_BLOCK();
		AnimationClipParser04.READ_STRINGS();
		for (var i: number = 0, n: number = AnimationClipParser04._BLOCK.count; i < n; i++) {
			var index: number = reader.getUint16();
			var blockName: string = AnimationClipParser04._strings[index];
			var fn: ()=>void = (AnimationClipParser04 as any)["READ_" + blockName];
			if (fn == null)
				throw new Error("model file err,no this function:" + index + " " + blockName);
			else
				fn.call(null);
		}
		AnimationClipParser04._version = null;
		AnimationClipParser04._reader = null;
		AnimationClipParser04._animationClip = null;
	}

	/**
	 * @internal
	 */
	static READ_ANIMATIONS(): void {
		var i: number, j: number;
		var node: KeyframeNode;
		var reader: Byte = AnimationClipParser04._reader!;

		var startTimeTypes: number[] = [];
		var startTimeTypeCount: number = reader.getUint16();
		startTimeTypes.length = startTimeTypeCount;
		for (i = 0; i < startTimeTypeCount; i++)
			startTimeTypes[i] = reader.getFloat32();

		var clip: AnimationClip = AnimationClipParser04._animationClip!;
		clip.name = AnimationClipParser04._strings[reader.getUint16()];
		var clipDur: number = clip._duration = reader.getFloat32();
		clip.islooping = !!reader.getByte();
		clip._frameRate = reader.getInt16();
		var nodeCount: number = reader.getInt16();
		var nodes: KeyframeNodeList = clip._nodes!;
		nodes.count = nodeCount;
		var nodesMap: any = clip._nodesMap = {};
		var nodesDic: any = clip._nodesDic = {};

		for (i = 0; i < nodeCount; i++) {
			node = new KeyframeNode();
			nodes.setNodeByIndex(i, node);
			node._indexInList = i;
			var type: number = node.type = reader.getUint8();

			var pathLength: number = reader.getUint16();
			node._setOwnerPathCount(pathLength);
			for (j = 0; j < pathLength; j++)
				node._setOwnerPathByIndex(j, AnimationClipParser04._strings[reader.getUint16()]);//TODO:如果只有根节点并且为空，是否可以和componentType一样优化。

			var nodePath: string = node._joinOwnerPath("/");
			var mapArray: KeyframeNode[] = nodesMap[nodePath];
			(mapArray) || (nodesMap[nodePath] = mapArray = []);
			mapArray.push(node);

			node.propertyOwner = AnimationClipParser04._strings[reader.getUint16()];

			var propertyLength: number = reader.getUint16();
			node._setPropertyCount(propertyLength);
			for (j = 0; j < propertyLength; j++)
				node._setPropertyByIndex(j, AnimationClipParser04._strings[reader.getUint16()]);

			var fullPath: string = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
			nodesDic[fullPath] = node;
			node.fullPath = fullPath;
			node.nodePath = nodePath;

			var keyframeCount: number = reader.getUint16();
			node._setKeyframeCount(keyframeCount);
			switch (AnimationClipParser04._version) {
				case "LAYAANIMATION:04":
					for (j = 0; j < keyframeCount; j++) {
						switch (type) {
							case 0:
								var floatKeyframe: FloatKeyframe = new FloatKeyframe();
								node._setKeyframeByIndex(j, floatKeyframe);
								floatKeyframe.time = startTimeTypes[reader.getUint16()];
								floatKeyframe.inTangent = reader.getFloat32();
								floatKeyframe.outTangent = reader.getFloat32();
								floatKeyframe.value = reader.getFloat32();
								break;
							case 1:
							case 3:
							case 4:
								var floatArrayKeyframe: Vector3Keyframe = new Vector3Keyframe();
								node._setKeyframeByIndex(j, floatArrayKeyframe);
								floatArrayKeyframe.time = startTimeTypes[reader.getUint16()];
								var inTangent: Vector3 = floatArrayKeyframe.inTangent;
								var outTangent: Vector3 = floatArrayKeyframe.outTangent;
								var value: Vector3 = floatArrayKeyframe.value;
								inTangent.x = reader.getFloat32();
								inTangent.y = reader.getFloat32();
								inTangent.z = reader.getFloat32();
								outTangent.x = reader.getFloat32();
								outTangent.y = reader.getFloat32();
								outTangent.z = reader.getFloat32();
								value.x = reader.getFloat32();
								value.y = reader.getFloat32();
								value.z = reader.getFloat32();
								break;
							case 2:
								var quaternionKeyframe: QuaternionKeyframe = new QuaternionKeyframe();
								node._setKeyframeByIndex(j, quaternionKeyframe);
								quaternionKeyframe.time = startTimeTypes[reader.getUint16()];
								var inTangentQua: Vector4 = quaternionKeyframe.inTangent;
								var outTangentQua: Vector4 = quaternionKeyframe.outTangent;
								var valueQua: Quaternion = quaternionKeyframe.value;
								inTangentQua.x = reader.getFloat32();
								inTangentQua.y = reader.getFloat32();
								inTangentQua.z = reader.getFloat32();
								inTangentQua.w = reader.getFloat32();
								outTangentQua.x = reader.getFloat32();
								outTangentQua.y = reader.getFloat32();
								outTangentQua.z = reader.getFloat32();
								outTangentQua.w = reader.getFloat32();
								valueQua.x = reader.getFloat32();
								valueQua.y = reader.getFloat32();
								valueQua.z = reader.getFloat32();
								valueQua.w = reader.getFloat32();
								break;
							default:
								throw "AnimationClipParser04:unknown type.";
						}
					}
					break;
				case "LAYAANIMATION:COMPRESSION_04":
					for (j = 0; j < keyframeCount; j++) {
						switch (type) {
							case 0:
								floatKeyframe = new FloatKeyframe();
								node._setKeyframeByIndex(j, floatKeyframe);
								floatKeyframe.time = startTimeTypes[reader.getUint16()];
								floatKeyframe.inTangent = HalfFloatUtils.convertToNumber(reader.getUint16());
								floatKeyframe.outTangent = HalfFloatUtils.convertToNumber(reader.getUint16());
								floatKeyframe.value = HalfFloatUtils.convertToNumber(reader.getUint16());
								break;
							case 1:
							case 3:
							case 4:
								floatArrayKeyframe = new Vector3Keyframe();
								node._setKeyframeByIndex(j, floatArrayKeyframe);
								floatArrayKeyframe.time = startTimeTypes[reader.getUint16()];

								inTangent = floatArrayKeyframe.inTangent;
								outTangent = floatArrayKeyframe.outTangent;
								value = floatArrayKeyframe.value;
								inTangent.x = HalfFloatUtils.convertToNumber(reader.getUint16());
								inTangent.y = HalfFloatUtils.convertToNumber(reader.getUint16());
								inTangent.z = HalfFloatUtils.convertToNumber(reader.getUint16());
								outTangent.x = HalfFloatUtils.convertToNumber(reader.getUint16());
								outTangent.y = HalfFloatUtils.convertToNumber(reader.getUint16());
								outTangent.z = HalfFloatUtils.convertToNumber(reader.getUint16());
								value.x = HalfFloatUtils.convertToNumber(reader.getUint16());
								value.y = HalfFloatUtils.convertToNumber(reader.getUint16());
								value.z = HalfFloatUtils.convertToNumber(reader.getUint16());
								break;
							case 2:
								quaternionKeyframe = new QuaternionKeyframe();
								node._setKeyframeByIndex(j, quaternionKeyframe);
								quaternionKeyframe.time = startTimeTypes[reader.getUint16()];

								inTangentQua = quaternionKeyframe.inTangent;
								outTangentQua = quaternionKeyframe.outTangent;
								valueQua = quaternionKeyframe.value;
								inTangentQua.x = HalfFloatUtils.convertToNumber(reader.getUint16());
								inTangentQua.y = HalfFloatUtils.convertToNumber(reader.getUint16());
								inTangentQua.z = HalfFloatUtils.convertToNumber(reader.getUint16());
								inTangentQua.w = HalfFloatUtils.convertToNumber(reader.getUint16());
								outTangentQua.x = HalfFloatUtils.convertToNumber(reader.getUint16());
								outTangentQua.y = HalfFloatUtils.convertToNumber(reader.getUint16());
								outTangentQua.z = HalfFloatUtils.convertToNumber(reader.getUint16());
								outTangentQua.w = HalfFloatUtils.convertToNumber(reader.getUint16());
								valueQua.x = HalfFloatUtils.convertToNumber(reader.getUint16());
								valueQua.y = HalfFloatUtils.convertToNumber(reader.getUint16());
								valueQua.z = HalfFloatUtils.convertToNumber(reader.getUint16());
								valueQua.w = HalfFloatUtils.convertToNumber(reader.getUint16());
								break;
							default:
								throw "AnimationClipParser04:unknown type.";
						}
					}
					break;
			}

		}

		var eventCount: number = reader.getUint16();
		for (i = 0; i < eventCount; i++) {
			var event: AnimationEvent = new AnimationEvent();
			event.time = Math.min(clipDur, reader.getFloat32());//TODO:事件时间可能大于动画总时长
			event.eventName = AnimationClipParser04._strings[reader.getUint16()];
			var params: Array<number|string|boolean> = [];
			var paramCount: number = reader.getUint16();
			(paramCount > 0) && (event.params = params = []);

			for (j = 0; j < paramCount; j++) {
				var eventType: number = reader.getByte();
				switch (eventType) {
					case 0:
						params.push(!!reader.getByte());
						break;
					case 1:
						params.push(reader.getInt32());
						break;
					case 2:
						params.push(reader.getFloat32());
						break;
					case 3:
						params.push(AnimationClipParser04._strings[reader.getUint16()]);
						break;
					default:
						throw new Error("unknown type.");
				}
			}
			clip.addEvent(event);
		}
	}
}

