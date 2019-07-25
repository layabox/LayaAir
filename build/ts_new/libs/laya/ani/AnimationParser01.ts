import { AnimationTemplet } from "./AnimationTemplet";
import { AnimationContent } from "./AnimationContent";
import { AnimationNodeContent } from "./AnimationNodeContent";
import { KeyFramesContent } from "./KeyFramesContent";
import { IAniLib } from "./AniLibPack";
import { Byte } from "../utils/Byte";

/**
 * @internal
 */
export class AnimationParser01 {
	/**
	 * @private
	 */
	static parse(templet: AnimationTemplet, reader: Byte): void {
		var data: ArrayBuffer = reader.__getBuffer();
		var i: number, j: number, k: number, n: number, l: number, m: number, o: number;
		//if (head != KeyframesAniTemplet.LAYA_ANIMATION_VISION)
		//{
		//trace("[Error] Version " + _aniVersion + " The engine is inconsistent, update to the version " + KeyframesAniTemplet.LAYA_ANIMATION_VISION + " please.");
		//return;
		//}
		var aniClassName: string = reader.readUTFString();//字符串(动画播放器类名，缺省为ANI)
		templet._aniClassName = aniClassName;
		var strList: any[] = reader.readUTFString().split("\n");//字符串(\n分割 UTF8 )
		var aniCount: number = reader.getUint8();//动画块数:Uint8

		var publicDataPos: number = reader.getUint32();//公用数据POS	
		var publicExtDataPos: number = reader.getUint32();//公用扩展数据POS

		var publicData: ArrayBuffer;//获取公用数据
		if (publicDataPos > 0)
			publicData = data.slice(publicDataPos, publicExtDataPos);
		var publicRead: Byte = new Byte(publicData);

		if (publicExtDataPos > 0)//获取公用扩展数据
			templet._publicExtData = data.slice(publicExtDataPos, data.byteLength);

		templet._useParent = !!reader.getUint8();
		templet._anis.length = aniCount;

		for (i = 0; i < aniCount; i++) {
			var ani: AnimationContent = templet._anis[i] = new AnimationContent();
			//[IF-SCRIPT] {};//不要删除
			ani.nodes = [];
			var name: string = ani.name = strList[reader.getUint16()];//获得骨骼名字

			templet._aniMap[name] = i;//按名字可以取得动画索引
			ani.bone3DMap = {};
			ani.playTime = reader.getFloat32();//本骨骼播放时间
			var boneCount: number = ani.nodes.length = reader.getUint8();//得到本动画骨骼数目

			ani.totalKeyframeDatasLength = 0;

			for (j = 0; j < boneCount; j++) {
				var node: AnimationNodeContent = ani.nodes[j] = new AnimationNodeContent();
				//[IF-SCRIPT] {};//不要删除
				node.childs = [];

				var nameIndex: number = reader.getInt16();
				if (nameIndex >= 0) {
					node.name = strList[nameIndex];//骨骼名字
					ani.bone3DMap[node.name] = j;
				}

				node.keyFrame = [];
				node.parentIndex = reader.getInt16();//父对象编号，相对本动画(INT16,-1表示没有)
				node.parentIndex == -1 ? node.parent = null : node.parent = ani.nodes[node.parentIndex]

				node.lerpType = reader.getUint8();//该节点插值类型:0为不插值，1为逐节点插值，2为私有插值

				var keyframeParamsOffset: number = reader.getUint32();//相对于数据扩展区的偏移地址
				publicRead.pos = keyframeParamsOffset;//切换到数据区偏移地址

				var keyframeDataCount: number = node.keyframeWidth = publicRead.getUint16();//keyframe数据宽度:Uint8		
				ani.totalKeyframeDatasLength += keyframeDataCount;
				//每个数据的插值方式:Uint8*keyframe数据宽度
				if (node.lerpType === 0 || node.lerpType === 1)//是否逐节点插值
				{
					node.interpolationMethod = [];
					node.interpolationMethod.length = keyframeDataCount;
					for (k = 0; k < keyframeDataCount; k++)
						node.interpolationMethod[k] = IAniLib.AnimationTemplet.interpolation[publicRead.getUint8()];
				}

				if (node.parent != null)
					node.parent.childs.push(node);

				var privateDataLen: number = reader.getUint16();//"UINT16", [1],//私有数据长度
				if (privateDataLen > 0) {
					//"BYTE", [1],//私有数据
					node.extenData = data.slice(reader.pos, reader.pos + privateDataLen);
					reader.pos += privateDataLen;
				}

				var keyframeCount: number = reader.getUint16();
				node.keyFrame.length = keyframeCount;
				var startTime: number = 0;
				var keyFrame: KeyFramesContent;
				for (k = 0, n = keyframeCount; k < n; k++) {
					keyFrame = node.keyFrame[k] = new KeyFramesContent();
					//[IF-SCRIPT] {};//不要删除
					keyFrame.duration = reader.getFloat32();
					keyFrame.startTime = startTime;

					if (node.lerpType === 2)//是否逐帧插值
					{
						keyFrame.interpolationData = [];
						var interDataLength: number = reader.getUint8();//插值数据长度
						var lerpType: number;
						lerpType = reader.getFloat32();
						switch (lerpType) {
							case 254: //全线性插值
								keyFrame.interpolationData.length = keyframeDataCount;
								for (o = 0; o < keyframeDataCount; o++)
									keyFrame.interpolationData[o] = 0;
								break;
							case 255: //全不插值
								keyFrame.interpolationData.length = keyframeDataCount;
								for (o = 0; o < keyframeDataCount; o++)
									keyFrame.interpolationData[o] = 5;
								break;
							default:
								keyFrame.interpolationData.push(lerpType);
								for (m = 1; m < interDataLength; m++) {
									keyFrame.interpolationData.push(reader.getFloat32());
								}
						}
						//for (m = 0; m < interDataLength; m++) {
						//var lerpData:int = read.getFloat32();//插值数据
						//switch (lerpData) {
						//case 254: //全线性插值
						//keyFrame.interpolationData.length = keyframeDataCount;
						//for (o = 0; o < keyframeDataCount; o++)
						//keyFrame.interpolationData[o] = 0;
						//break;
						//case 255: //全不插值
						//
						//keyFrame.interpolationData.length = keyframeDataCount;
						//for (o = 0; o < keyframeDataCount; o++)
						//keyFrame.interpolationData[o] = 5;
						//break;
						//default: 
						//keyFrame.interpolationData.push(lerpData);
						//}
						//}

					}

					keyFrame.data = new Float32Array(keyframeDataCount);
					keyFrame.dData = new Float32Array(keyframeDataCount);
					keyFrame.nextData = new Float32Array(keyframeDataCount);
					for (l = 0; l < keyframeDataCount; l++) {
						keyFrame.data[l] = reader.getFloat32();
						if (keyFrame.data[l] > -0.00000001 && keyFrame.data[l] < 0.00000001) keyFrame.data[l] = 0;
					}
					startTime += keyFrame.duration;
				}
				keyFrame.startTime = ani.playTime;//因工具BUG，矫正最后一帧startTime
				node.playTime = ani.playTime;//节点总时间可能比总时长大，次处修正
				templet._calculateKeyFrame(node, keyframeCount, keyframeDataCount);
			}
		}
	}
}


