import { AnimationClip2D } from "./AnimationClip2D";
import { KeyframeNode2D } from "./KeyframeNode2D";
import { Keyframe2D } from "./KeyFrame2D";
import { Animation2DEvent } from "./Animation2DEvent";
import { Byte } from "../utils/Byte";

/**
 * @en Class for AnimationClip resource parsing
 * @zh 用于AnimationClip资源解析
 */
export class AnimationClip2DParse01 {
    /**@internal */
    private static _clip: AnimationClip2D | null;
    /**@internal */
    private static _reader: Byte | null;
    /**@internal */
    private static _version: string | null;
    /**@internal */
    private static _strings: string[] = [];
    /**@internal */
    private static _DATA = { offset: 0, size: 0 };
    /**@internal */
    private static _BLOCK: { count: number, blockStarts?: number[], blockLengths?: number[] } = { count: 0 };

    /**
     * @internal
     */
    private static READ_DATA() {
        this._DATA.offset = this._reader!.readUint32();
        this._DATA.size = this._reader!.readUint32();
    }

    /**
     * @internal
     */
    private static READ_BLOCK() {
        var count = this._BLOCK.count = this._reader!.readUint16();
        var blockStarts: number[] = this._BLOCK.blockStarts = [];
        var blockLengths: number[] = this._BLOCK.blockLengths = [];
        for (var i = 0; i < count; i++) {
            blockStarts.push(this._reader!.readUint32());
            blockLengths.push(this._reader!.readUint32());
        }
    }

    /**
     * @internal
     */
    private static READ_STRINGS() {
        var offset = this._reader!.readUint32();
        var count = this._reader!.readUint16();
        var prePos = this._reader!.pos;
        this._reader!.pos = offset + this._DATA.offset;

        for (var i = 0; i < count; i++)
            this._strings[i] = this._reader!.readUTFString();
        this._reader!.pos = prePos;
    }

    /**
     * @internal
     * @en Parses the animation data from the specified reader and clip, based on the given version.
     * @param clip The animation clip to be parsed into.
     * @param reader The reader containing the binary data of the animation.
     * @param version The version of the animation file format.
     * @zh 根据指定的版本，从指定的读取器和剪辑解析动画数据.
     * @param clip 要解析的动画剪辑.
     * @param reader 包含动画二进制数据的读取器.
     * @param version 动画文件格式的版本.
     */
    static parse(clip: AnimationClip2D, reader: Byte, version: string) {
        this._clip = clip;
        this._reader = reader;
        this._version = version;
        this.READ_DATA();
        this.READ_BLOCK();
        this.READ_STRINGS();

        for (var i = 0, n = this._BLOCK.count; i < n; i++) {
            var index = reader.readUint16();
            var blockName = this._strings[index];
            var fn: () => void = (this as any)["READ_" + blockName];
            if (!fn) {
                throw new Error("model file err,no this function:" + index + " " + blockName);
            }
            else
                fn.call(this);
        }

        this._version = null;
        this._reader = null;
        this._clip = null;
        this._strings.length = 0;

    }

    /**
     * @internal
     * @param second 
     * @param fps 
     * @returns 
     */
    private static timeToFrame(second: number, fps: number): number {
        return Math.round(second * fps);
    }

    /**
     * @internal
     */
    static READ_ANIMATIONS2D(): void {
        var i: number, j: number;

        var reader = this._reader!;
        var clip = this._clip!;
        var node: KeyframeNode2D;

        var numList: number[] = [];
        var numCount = reader.readUint16();
        numList.length = numCount;
        for (i = 0; i < numCount; i++) {
            numList[i] = reader.readFloat32();
        }

        var clipDur = clip._duration = numList[reader.readInt16()];
        clip.islooping = !!reader.readByte();
        clip._frameRate = reader.readInt16();
        var nodeCount = reader.readInt16();

        var nodes = clip._nodes!;
        nodes.count = nodeCount;
        var nodesMap: Record<string, KeyframeNode2D[]> = clip._nodesMap = {};
        var nodesDic: Record<string, KeyframeNode2D> = clip._nodesDic = {};

        for (i = 0; i < nodeCount; i++) {
            node = new KeyframeNode2D();
            nodes.setNodeByIndex(i, node);
            node._indexInList = i;

            var pathLength = reader.readUint16();
            node._setOwnerPathCount(pathLength);

            for (j = 0; j < pathLength; j++) {
                node._setOwnerPathByIndex(j, this._strings[reader.readUint16()]);
            }
            var nodePath = node._joinOwnerPath("/");
            var mapArray = nodesMap[nodePath];
            (mapArray) || (nodesMap[nodePath] = mapArray = []);
            mapArray.push(node);


            var propertyLength = reader.readUint16();
            node._setPropertyCount(propertyLength);
            for (j = 0; j < propertyLength; j++) {
                node._setPropertyByIndex(j, this._strings[reader.readUint16()]);
            }
            var fullPath = nodePath + "." + node._joinProperty(".");
            nodesDic[fullPath] = node;
            node.fullPath = fullPath;
            node.nodePath = nodePath;

            var keyframeCount = reader.readUint16();
            //node._setKeyframeCount(keyframeCount);
            for (j = 0; j < keyframeCount; j++) {
                var k = new Keyframe2D();
                k.time = numList[reader.readUint16()];
                k.data = { f: this.timeToFrame(k.time, clip._frameRate), val: 0 };

                if (1 == reader.readByte()) {
                    k.data.tweenType = this._strings[reader.readUint16()];
                }

                if (1 == reader.readByte()) {
                    k.data.tweenInfo = {};

                    k.data.tweenInfo.inTangent = numList[reader.readUint16()];
                    k.data.tweenInfo.outTangent = numList[reader.readUint16()];

                    // if (Infinity == Math.abs(k.data.tweenInfo.inTangent)) {
                    //     k.data.tweenInfo.inTangent = Number.MAX_VALUE;
                    //     if (0 > k.data.tweenInfo.inTangent) {
                    //         k.data.tweenInfo.inTangent *= -1;
                    //     }
                    // }
                    // if (Infinity == Math.abs(k.data.tweenInfo.outTangent)) {
                    //     k.data.tweenInfo.outTangent = Number.MAX_VALUE;
                    //     if (0 > k.data.tweenInfo.outTangent) {
                    //         k.data.tweenInfo.outTangent *= -1;
                    //     }
                    // }


                    if (1 == reader.readByte()) {
                        k.data.tweenInfo.inWeight = numList[reader.readUint16()];
                    }

                    if (1 == reader.readByte()) {
                        k.data.tweenInfo.outWeight = numList[reader.readUint16()];
                    }
                }
                var num = reader.readByte();
                if (0 == num) {
                    k.data.val = numList[reader.readUint16()];
                } else if (1 == num) {
                    k.data.val = this._strings[reader.readUint16()];
                } else if (2 == num) {
                    k.data.val = !!reader.readByte();
                }

                if (1 == reader.readByte()) {
                    try {
                        k.data.extend = JSON.parse(this._strings[reader.readUint16()])
                    } catch (err) { }
                }
                node._keyFrames.push(k);
            }
        }
        var eventCount = reader.readUint16();
        for (i = 0; i < eventCount; i++) {
            var event = new Animation2DEvent();
            //event.time = Math.min(clipDur, numList[reader.readUint16()]);
            event.time = numList[reader.readUint16()];
            event.eventName = this._strings[reader.readUint16()];
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
                        params.push(numList[reader.readUint16()]);
                        break;
                    case 3:
                        params.push(this._strings[reader.readUint16()]);
                        break;
                    default:
                        throw new Error("unknown type.");
                }
            }
            clip.addEvent(event);
        }

    }
}