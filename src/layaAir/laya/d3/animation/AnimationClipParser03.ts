import { KeyframeNode } from "./KeyframeNode";
import { KeyframeNodeList } from "./KeyframeNodeList";
import { AnimationEvent } from "./AnimationEvent";
import { Byte } from "../../utils/Byte"
import { AnimationClip } from "./AnimationClip";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { FloatKeyframe } from "../../maths/FloatKeyframe";
import { QuaternionKeyframe } from "../../maths/QuaternionKeyframe";
import { Vector3Keyframe } from "../../maths/Vector3Keyframe";

/**
 * @internal
 * @en A tool class for parsing AnimationClip data.
 * @zh 解析AnimationClip数据的工具类。
 */
export class AnimationClipParser03 {
    private static _animationClip: AnimationClip;
    private static _reader: Byte;
    private static _strings: any[] = [];
    private static _BLOCK: any = { count: 0 };
    private static _DATA: any = { offset: 0, size: 0 };

    private static READ_DATA(): void {
        AnimationClipParser03._DATA.offset = AnimationClipParser03._reader.readUint32();
        AnimationClipParser03._DATA.size = AnimationClipParser03._reader.readUint32();
    }

    private static READ_BLOCK(): void {
        var count: number = AnimationClipParser03._BLOCK.count = AnimationClipParser03._reader.readUint16();
        var blockStarts: any[] = AnimationClipParser03._BLOCK.blockStarts = [];
        var blockLengths: any[] = AnimationClipParser03._BLOCK.blockLengths = [];
        for (var i: number = 0; i < count; i++) {
            blockStarts.push(AnimationClipParser03._reader.readUint32());
            blockLengths.push(AnimationClipParser03._reader.readUint32());
        }
    }

    private static READ_STRINGS(): void {
        var offset: number = AnimationClipParser03._reader.readUint32();
        var count: number = AnimationClipParser03._reader.readUint16();
        var prePos: number = AnimationClipParser03._reader.pos;
        AnimationClipParser03._reader.pos = offset + AnimationClipParser03._DATA.offset;

        for (var i: number = 0; i < count; i++)
            AnimationClipParser03._strings[i] = AnimationClipParser03._reader.readUTFString();
        AnimationClipParser03._reader.pos = prePos;
    }

    /**
     * @internal
     * @en Parse the AnimationClip data from the byte reader.
     * This method reads the AnimationClip data, including blocks and strings, and processes each block according to its type.
     * @param clip The AnimationClip object to be populated with parsed data.
     * @param reader The Byte reader containing the AnimationClip data.
     * @zh 从字节读取器中解析AnimationClip数据。
     * 此方法读取AnimationClip数据，包括块和字符串，并根据每个块的类型进行处理。
     * @param clip 要填充解析数据的 AnimationClip 对象。
     * @param reader 包含AnimationClip数据的字节读取器。
     */
    static parse(clip: AnimationClip, reader: Byte): void {
        AnimationClipParser03._animationClip = clip;
        AnimationClipParser03._reader = reader;

        AnimationClipParser03.READ_DATA();
        AnimationClipParser03.READ_BLOCK();
        AnimationClipParser03.READ_STRINGS();
        for (var i: number = 0, n: number = AnimationClipParser03._BLOCK.count; i < n; i++) {
            var index: number = reader.readUint16();
            var blockName: string = AnimationClipParser03._strings[index];
            var fn: () => void = (AnimationClipParser03 as any)["READ_" + blockName];
            if (fn == null)
                throw new Error("model file err,no this function:" + index + " " + blockName);
            else
                fn.call(null);
        }
    }

    /**
     * @internal
     * @en Read and parse animation data from the byte reader.
     * This method reads AnimationClip information, keyframe nodes, and animation events.
     * It populates the AnimationClip object with the parsed data.
     * @zh 从字节读取器中读取并解析动画数据。
     * 此方法读取AnimationClip信息、关键帧节点和动画事件。
     * 它用解析的数据填充 AnimationClip 对象。
     */
    static READ_ANIMATIONS(): void {
        var i: number, j: number;
        var node: KeyframeNode;
        var reader: Byte = AnimationClipParser03._reader;

        var startTimeTypes: number[] = [];
        var startTimeTypeCount: number = reader.readUint16();
        startTimeTypes.length = startTimeTypeCount;
        for (i = 0; i < startTimeTypeCount; i++)
            startTimeTypes[i] = reader.readFloat32();

        var clip: AnimationClip = AnimationClipParser03._animationClip;
        clip.name = AnimationClipParser03._strings[reader.readUint16()];
        var clipDur: number = clip._duration = reader.readFloat32();
        clip.islooping = !!reader.readByte();
        clip._frameRate = reader.readInt16();
        var nodeCount: number = reader.readInt16();
        var nodes = clip._nodes;
        (nodes as KeyframeNodeList).count = nodeCount;
        var nodesMap: any = clip._nodesMap = {};
        var nodesDic: any = clip._nodesDic = {};

        for (i = 0; i < nodeCount; i++) {
            node = new KeyframeNode();
            (nodes as KeyframeNodeList).setNodeByIndex(i, node);
            node._indexInList = i;
            var type: number = node.type = reader.readUint8();

            var pathLength: number = reader.readUint16();
            node._setOwnerPathCount(pathLength);
            for (j = 0; j < pathLength; j++)
                node._setOwnerPathByIndex(j, AnimationClipParser03._strings[reader.readUint16()]);//TODO:如果只有根节点并且为空，是否可以和componentType一样优化。

            var nodePath: string = node._joinOwnerPath("/");
            var mapArray: KeyframeNode[] = nodesMap[nodePath];
            (mapArray) || (nodesMap[nodePath] = mapArray = []);
            mapArray.push(node);

            node.propertyOwner = AnimationClipParser03._strings[reader.readUint16()];

            var propertyLength: number = reader.readUint16();
            node._setPropertyCount(propertyLength);
            for (j = 0; j < propertyLength; j++)
                node._setPropertyByIndex(j, AnimationClipParser03._strings[reader.readUint16()]);

            var fullPath: string = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
            nodesDic[fullPath] = node;
            node.fullPath = fullPath;

            var keyframeCount: number = reader.readUint16();
            node._setKeyframeCount(keyframeCount);

            for (j = 0; j < keyframeCount; j++) {
                switch (type) {
                    case 0:
                        var floatKeyframe: FloatKeyframe = new FloatKeyframe();
                        node._setKeyframeByIndex(j, floatKeyframe);
                        floatKeyframe.time = startTimeTypes[reader.readUint16()];
                        floatKeyframe.inTangent = reader.readFloat32();
                        floatKeyframe.outTangent = reader.readFloat32();
                        floatKeyframe.value = reader.readFloat32();
                        break;
                    case 1:
                    case 3:
                    case 4:
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
                    case 2:
                        var quaArrayKeyframe: QuaternionKeyframe = new QuaternionKeyframe();
                        node._setKeyframeByIndex(j, quaArrayKeyframe);
                        quaArrayKeyframe.time = startTimeTypes[reader.readUint16()];

                        var inTangentQua: Vector4 = quaArrayKeyframe.inTangent;
                        var outTangentQua: Vector4 = quaArrayKeyframe.outTangent;
                        var valueQua: Quaternion = quaArrayKeyframe.value;
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
                    default:
                        throw new Error("AnimationClipParser03:unknown type.");
                }
            }
        }
        var eventCount: number = reader.readUint16();
        for (i = 0; i < eventCount; i++) {
            var event: AnimationEvent = new AnimationEvent();
            event.time = Math.min(clipDur, reader.readFloat32());//TODO:事件时间可能大于动画总时长
            event.eventName = AnimationClipParser03._strings[reader.readUint16()];
            var params: Array<number | boolean | string> = [];
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
                        params.push(AnimationClipParser03._strings[reader.readUint16()]);
                        break;
                    default:
                        throw new Error("unknown type.");
                }
            }
            clip.addEvent(event);
        }
    }
}

