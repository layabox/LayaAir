import { AnimationTemplet } from "./AnimationTemplet";
import { AnimationContent } from "./AnimationContent";
import { AnimationNodeContent } from "./AnimationNodeContent";
import { KeyFramesContent } from "./KeyFramesContent";
import { IAniLib } from "./AniLibPack";
import { Byte } from "../utils/Byte";

/**
 * @internal
 */
export class AnimationParser02 {
	/**@internal */
	private static _templet: AnimationTemplet;
	/**@internal */
	private static _reader: Byte;
	/**@internal */
	private static _strings: any[] = [];
	/**@internal */
	private static _BLOCK: any = { count: 0 };
	/**@internal */
	private static _DATA: any = { offset: 0, size: 0 };

	/**
	 * @private
	 */
	private static READ_DATA(): void {
		AnimationParser02._DATA.offset = AnimationParser02._reader.getUint32();
		AnimationParser02._DATA.size = AnimationParser02._reader.getUint32();
	}

	/**
	 * @private
	 */
	//TODO:coverage
	private static READ_BLOCK(): void {
		var count: number = AnimationParser02._BLOCK.count = AnimationParser02._reader.getUint16();
		var blockStarts: any[] = AnimationParser02._BLOCK.blockStarts = [];
		var blockLengths: any[] = AnimationParser02._BLOCK.blockLengths = [];
		for (var i: number = 0; i < count; i++) {
			blockStarts.push(AnimationParser02._reader.getUint32());
			blockLengths.push(AnimationParser02._reader.getUint32());
		}
	}

	/**
	 * @private
	 */
	//TODO:coverage
	private static READ_STRINGS(): void {
		var offset: number = AnimationParser02._reader.getUint32();
		var count: number = AnimationParser02._reader.getUint16();
		var prePos: number = AnimationParser02._reader.pos;
		AnimationParser02._reader.pos = offset + AnimationParser02._DATA.offset;

		for (var i: number = 0; i < count; i++)
			AnimationParser02._strings[i] = AnimationParser02._reader.readUTFString();

		AnimationParser02._reader.pos = prePos;
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static parse(templet: AnimationTemplet, reader: Byte): void {
		AnimationParser02._templet = templet;
		AnimationParser02._reader = reader;
		var arrayBuffer: ArrayBuffer = reader.__getBuffer();
		AnimationParser02.READ_DATA();
		AnimationParser02.READ_BLOCK();
		AnimationParser02.READ_STRINGS();
		for (var i: number = 0, n: number = AnimationParser02._BLOCK.count; i < n; i++) {
			var index: number = reader.getUint16();
			var blockName: string = AnimationParser02._strings[index];
			var fn: Function = (AnimationParser02 as any)["READ_" + blockName];
			if (fn == null)
				throw new Error("model file err,no this function:" + index + " " + blockName);
			else
				fn.call(null);
		}
	}

	//TODO:coverage
	static READ_ANIMATIONS(): void {
		var reader: Byte = AnimationParser02._reader;
		var arrayBuffer: ArrayBuffer = reader.__getBuffer();
		var i: number, j: number, k: number, n: number, l: number;
		var keyframeWidth: number = reader.getUint16();
		var interpolationMethod: any[] = [];
		interpolationMethod.length = keyframeWidth;
		for (i = 0; i < keyframeWidth; i++)
			interpolationMethod[i] = IAniLib.AnimationTemplet.interpolation[reader.getByte()];

		var aniCount: number = reader.getUint8();
		AnimationParser02._templet._anis.length = aniCount;

		for (i = 0; i < aniCount; i++) {
			var ani: AnimationContent = AnimationParser02._templet._anis[i] = new AnimationContent();
			ani.nodes = [];
			var aniName: string = ani.name = AnimationParser02._strings[reader.getUint16()];
			AnimationParser02._templet._aniMap[aniName] = i;//按名字可以取得动画索引
			ani.bone3DMap = {};
			ani.playTime = reader.getFloat32();
			var boneCount: number = ani.nodes.length = reader.getInt16();
			ani.totalKeyframeDatasLength = 0;
			for (j = 0; j < boneCount; j++) {
				var node: AnimationNodeContent = ani.nodes[j] = new AnimationNodeContent();
				node.keyframeWidth = keyframeWidth;//TODO:存在骨骼里是否合并，需要优化到动画中更合理。
				node.childs = [];

				var nameIndex: number = reader.getUint16();
				if (nameIndex >= 0) {
					node.name = AnimationParser02._strings[nameIndex];//骨骼名字
					ani.bone3DMap[node.name] = j;
				}

				node.keyFrame = [];
				node.parentIndex = reader.getInt16();//父对象编号，相对本动画(INT16,-1表示没有)
				node.parentIndex == -1 ? node.parent = null : node.parent = ani.nodes[node.parentIndex]

				ani.totalKeyframeDatasLength += keyframeWidth;

				node.interpolationMethod = interpolationMethod;//TODO:

				if (node.parent != null)
					node.parent.childs.push(node);

				var keyframeCount: number = reader.getUint16();
				node.keyFrame.length = keyframeCount;
				var keyFrame: KeyFramesContent = null, lastKeyFrame: KeyFramesContent = null;
				for (k = 0, n = keyframeCount; k < n; k++) {
					keyFrame = node.keyFrame[k] = new KeyFramesContent();
					keyFrame.startTime = reader.getFloat32();

					(lastKeyFrame) && (lastKeyFrame.duration = keyFrame.startTime - lastKeyFrame.startTime);

					keyFrame.dData = new Float32Array(keyframeWidth);
					keyFrame.nextData = new Float32Array(keyframeWidth);

					var offset: number = AnimationParser02._DATA.offset;

					var keyframeDataOffset: number = reader.getUint32();
					var keyframeDataLength: number = keyframeWidth * 4;
					var keyframeArrayBuffer: ArrayBuffer = arrayBuffer.slice(offset + keyframeDataOffset, offset + keyframeDataOffset + keyframeDataLength);
					keyFrame.data = new Float32Array(keyframeArrayBuffer);
					lastKeyFrame = keyFrame;
				}
				keyFrame.duration = 0;

				node.playTime = ani.playTime;//节点总时间可能比总时长大，次处修正
				AnimationParser02._templet._calculateKeyFrame(node, keyframeCount, keyframeWidth);
			}
		}
	}

}


