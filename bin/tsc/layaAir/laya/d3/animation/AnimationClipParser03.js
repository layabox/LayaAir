import { KeyframeNode } from "./KeyframeNode";
import { AnimationEvent } from "./AnimationEvent";
import { FloatKeyframe } from "../core/FloatKeyframe";
import { QuaternionKeyframe } from "../core/QuaternionKeyframe";
import { Vector3Keyframe } from "../core/Vector3Keyframe";
import { ConchQuaternion } from "../math/Native/ConchQuaternion";
import { ConchVector3 } from "../math/Native/ConchVector3";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Render } from "../../renders/Render";
/**
 * @internal
 */
export class AnimationClipParser03 {
    static READ_DATA() {
        AnimationClipParser03._DATA.offset = AnimationClipParser03._reader.getUint32();
        AnimationClipParser03._DATA.size = AnimationClipParser03._reader.getUint32();
    }
    static READ_BLOCK() {
        var count = AnimationClipParser03._BLOCK.count = AnimationClipParser03._reader.getUint16();
        var blockStarts = AnimationClipParser03._BLOCK.blockStarts = [];
        var blockLengths = AnimationClipParser03._BLOCK.blockLengths = [];
        for (var i = 0; i < count; i++) {
            blockStarts.push(AnimationClipParser03._reader.getUint32());
            blockLengths.push(AnimationClipParser03._reader.getUint32());
        }
    }
    static READ_STRINGS() {
        var offset = AnimationClipParser03._reader.getUint32();
        var count = AnimationClipParser03._reader.getUint16();
        var prePos = AnimationClipParser03._reader.pos;
        AnimationClipParser03._reader.pos = offset + AnimationClipParser03._DATA.offset;
        for (var i = 0; i < count; i++)
            AnimationClipParser03._strings[i] = AnimationClipParser03._reader.readUTFString();
        AnimationClipParser03._reader.pos = prePos;
    }
    /**
     * @internal
     */
    static parse(clip, reader) {
        AnimationClipParser03._animationClip = clip;
        AnimationClipParser03._reader = reader;
        var arrayBuffer = reader.__getBuffer();
        AnimationClipParser03.READ_DATA();
        AnimationClipParser03.READ_BLOCK();
        AnimationClipParser03.READ_STRINGS();
        for (var i = 0, n = AnimationClipParser03._BLOCK.count; i < n; i++) {
            var index = reader.getUint16();
            var blockName = AnimationClipParser03._strings[index];
            var fn = AnimationClipParser03["READ_" + blockName];
            if (fn == null)
                throw new Error("model file err,no this function:" + index + " " + blockName);
            else
                fn.call(null);
        }
    }
    /**
     * @internal
     */
    static READ_ANIMATIONS() {
        var i, j;
        var node;
        var reader = AnimationClipParser03._reader;
        var buffer = reader.__getBuffer();
        var startTimeTypes = [];
        var startTimeTypeCount = reader.getUint16();
        startTimeTypes.length = startTimeTypeCount;
        for (i = 0; i < startTimeTypeCount; i++)
            startTimeTypes[i] = reader.getFloat32();
        var clip = AnimationClipParser03._animationClip;
        clip.name = AnimationClipParser03._strings[reader.getUint16()];
        var clipDur = clip._duration = reader.getFloat32();
        clip.islooping = !!reader.getByte();
        clip._frameRate = reader.getInt16();
        var nodeCount = reader.getInt16();
        var nodes = clip._nodes;
        nodes.count = nodeCount;
        var nodesMap = clip._nodesMap = {};
        var nodesDic = clip._nodesDic = {};
        for (i = 0; i < nodeCount; i++) {
            node = new KeyframeNode();
            nodes.setNodeByIndex(i, node);
            node._indexInList = i;
            var type = node.type = reader.getUint8();
            var pathLength = reader.getUint16();
            node._setOwnerPathCount(pathLength);
            for (j = 0; j < pathLength; j++)
                node._setOwnerPathByIndex(j, AnimationClipParser03._strings[reader.getUint16()]); //TODO:如果只有根节点并且为空，是否可以和componentType一样优化。
            var nodePath = node._joinOwnerPath("/");
            var mapArray = nodesMap[nodePath];
            (mapArray) || (nodesMap[nodePath] = mapArray = []);
            mapArray.push(node);
            node.propertyOwner = AnimationClipParser03._strings[reader.getUint16()];
            var propertyLength = reader.getUint16();
            node._setPropertyCount(propertyLength);
            for (j = 0; j < propertyLength; j++)
                node._setPropertyByIndex(j, AnimationClipParser03._strings[reader.getUint16()]);
            var fullPath = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
            nodesDic[fullPath] = node;
            node.fullPath = fullPath;
            var keyframeCount = reader.getUint16();
            node._setKeyframeCount(keyframeCount);
            var startTime;
            switch (type) {
                case 0:
                    break;
                case 1:
                case 3:
                case 4:
                    node.data = Render.supportWebGLPlusAnimation ? new ConchVector3 : new Vector3();
                    break;
                case 2:
                    node.data = Render.supportWebGLPlusAnimation ? new ConchQuaternion : new Quaternion();
                    break;
                default:
                    throw "AnimationClipParser03:unknown type.";
            }
            for (j = 0; j < keyframeCount; j++) {
                switch (type) {
                    case 0:
                        var floatKeyframe = new FloatKeyframe();
                        node._setKeyframeByIndex(j, floatKeyframe);
                        startTime = floatKeyframe.time = startTimeTypes[reader.getUint16()];
                        floatKeyframe.inTangent = reader.getFloat32();
                        floatKeyframe.outTangent = reader.getFloat32();
                        floatKeyframe.value = reader.getFloat32();
                        break;
                    case 1:
                    case 3:
                    case 4:
                        var floatArrayKeyframe = new Vector3Keyframe();
                        node._setKeyframeByIndex(j, floatArrayKeyframe);
                        startTime = floatArrayKeyframe.time = startTimeTypes[reader.getUint16()];
                        if (Render.supportWebGLPlusAnimation) {
                            var data = floatArrayKeyframe.data = new Float32Array(3 * 3);
                            for (var k = 0; k < 3; k++)
                                data[k] = reader.getFloat32();
                            for (k = 0; k < 3; k++)
                                data[3 + k] = reader.getFloat32();
                            for (k = 0; k < 3; k++)
                                data[6 + k] = reader.getFloat32();
                        }
                        else {
                            var inTangent = floatArrayKeyframe.inTangent;
                            var outTangent = floatArrayKeyframe.outTangent;
                            var value = floatArrayKeyframe.value;
                            inTangent.x = reader.getFloat32();
                            inTangent.y = reader.getFloat32();
                            inTangent.z = reader.getFloat32();
                            outTangent.x = reader.getFloat32();
                            outTangent.y = reader.getFloat32();
                            outTangent.z = reader.getFloat32();
                            value.x = reader.getFloat32();
                            value.y = reader.getFloat32();
                            value.z = reader.getFloat32();
                        }
                        break;
                    case 2:
                        var quaArrayKeyframe = new QuaternionKeyframe();
                        node._setKeyframeByIndex(j, quaArrayKeyframe);
                        startTime = quaArrayKeyframe.time = startTimeTypes[reader.getUint16()];
                        if (Render.supportWebGLPlusAnimation) {
                            data = quaArrayKeyframe.data = new Float32Array(3 * 4);
                            for (k = 0; k < 4; k++)
                                data[k] = reader.getFloat32();
                            for (k = 0; k < 4; k++)
                                data[4 + k] = reader.getFloat32();
                            for (k = 0; k < 4; k++)
                                data[8 + k] = reader.getFloat32();
                        }
                        else {
                            var inTangentQua = quaArrayKeyframe.inTangent;
                            var outTangentQua = quaArrayKeyframe.outTangent;
                            var valueQua = quaArrayKeyframe.value;
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
                        }
                        break;
                    default:
                        throw "AnimationClipParser03:unknown type.";
                }
            }
        }
        var eventCount = reader.getUint16();
        for (i = 0; i < eventCount; i++) {
            var event = new AnimationEvent();
            event.time = Math.min(clipDur, reader.getFloat32()); //TODO:事件时间可能大于动画总时长
            event.eventName = AnimationClipParser03._strings[reader.getUint16()];
            var params;
            var paramCount = reader.getUint16();
            (paramCount > 0) && (event.params = params = []);
            for (j = 0; j < paramCount; j++) {
                var eventType = reader.getByte();
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
                        params.push(AnimationClipParser03._strings[reader.getUint16()]);
                        break;
                    default:
                        throw new Error("unknown type.");
                }
            }
            clip.addEvent(event);
        }
    }
}
AnimationClipParser03._strings = [];
AnimationClipParser03._BLOCK = { count: 0 };
AnimationClipParser03._DATA = { offset: 0, size: 0 };
