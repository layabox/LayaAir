package laya.ani {
	import laya.ani.math.BezierLerp;
	import laya.events.Event;
	import laya.maths.MathUtil;
	import laya.resource.Resource;
	import laya.utils.Byte;
	
	/**
	 * @private
	 * <code>AnimationTemplet</code> 类用于动画模板资源。
	 */
	public class AnimationTemplet extends Resource {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		public static var interpolation:Array = /*[STATIC SAFE]*/ [_LinearInterpolation_0, _QuaternionInterpolation_1, _AngleInterpolation_2, _RadiansInterpolation_3, _Matrix4x4Interpolation_4, _NoInterpolation_5, _BezierInterpolation_6, _BezierInterpolation_7];
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _LinearInterpolation_0(bone:AnimationNodeContent, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null):int {
			out[outOfs] = data[index] + dt * dData[index];
			return 1;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _QuaternionInterpolation_1(bone:*, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null):int {
			var amount:Number = duration === 0 ? 0 : dt / duration;
			MathUtil.slerpQuaternionArray(data, index, nextData, index, amount, out, outOfs);//(dt/duration)为amount比例
			return 4;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _AngleInterpolation_2(bone:AnimationNodeContent, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null):int {
			return 0;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _RadiansInterpolation_3(bone:AnimationNodeContent, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null):int {
			return 0;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _Matrix4x4Interpolation_4(bone:*, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null):int {
			for (var i:int = 0; i < 16; i++, index++)
				out[outOfs + i] = data[index] + dt * dData[index];
			return 16;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _NoInterpolation_5(bone:AnimationNodeContent, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null):int {
			out[outOfs] = data[index];
			return 1;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _BezierInterpolation_6(bone:AnimationNodeContent, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null, offset:int = 0):int {
			out[outOfs] = data[index] + (nextData[index] - data[index]) * BezierLerp.getBezierRate(dt / duration, interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
			return 5;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function _BezierInterpolation_7(bone:AnimationNodeContent, index:int, out:Float32Array, outOfs:int, data:Float32Array, dt:Number, dData:Float32Array, duration:Number, nextData:Float32Array, interData:Array = null, offset:int = 0):int {
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
		
		/**@private */
		public var _aniVersion:String;
		/**@private */
		public var _anis:Vector.<AnimationContent> = new Vector.<AnimationContent>;
		/**@private */
		public var _aniMap:* = {};
		/**@private */
		public var _publicExtData:ArrayBuffer;//公共扩展数据
		/**@private */
		public var _useParent:Boolean;//是否采用对象树数据格式
		/**@private */
		protected var unfixedCurrentFrameIndexes:Uint32Array;
		/**@private */
		protected var unfixedCurrentTimes:Float32Array;
		/**@private */
		protected var unfixedKeyframes:Vector.<KeyFramesContent>;
		/**@private */
		protected var unfixedLastAniIndex:int = -1;
		/**@private */
		public var _aniClassName:String;
		/**@private */
		public var _animationDatasCache:*;
		
		public var _fullFrames:Array=null;
		
		/**@private */
		private var _boneCurKeyFrm:Array = [];	// 记录每个骨骼当前在动画的第几帧。这个是为了去掉缓存的帧索引数据。TODO 其实这个应该放到skeleton中
		
		public function AnimationTemplet() {
		}
		
		/**
		 * @private
		 */
		public function parse(data:ArrayBuffer):void {//兼容函数
			var reader:Byte = new Byte(data);
			_aniVersion = reader.readUTFString();
			AnimationParser01.parse(this, reader);
		}
		
		/**
		 * @private
		 */
		public function _calculateKeyFrame(node:AnimationNodeContent, keyframeCount:int, keyframeDataCount:int):void {
			var keyFrames:Vector.<KeyFramesContent> = node.keyFrame;
			keyFrames[keyframeCount] = keyFrames[0];
			for (var i:int = 0; i < keyframeCount; i++) {
				var keyFrame:KeyFramesContent = keyFrames[i];
				for (var j:int = 0; j < keyframeDataCount; j++) {
					keyFrame.dData[j] = (keyFrame.duration === 0) ? 0 : (keyFrames[i + 1].data[j] - keyFrame.data[j]) / keyFrame.duration;//末帧dData数据为0
					keyFrame.nextData[j] = keyFrames[i + 1].data[j];
				}
			}
			keyFrames.length--;
		}
		
		/**
		 * @inheritDoc
		 */
		//TODO:coverage
		public function _onAsynLoaded(data:*,propertyParams:Object=null):void {
			var reader:Byte = new Byte(data);
			_aniVersion = reader.readUTFString();
			switch (_aniVersion) {
			case "LAYAANIMATION:02": 
				AnimationParser02.parse(this, reader);
				break;
			default: 
				AnimationParser01.parse(this, reader);
			}
		}
		
		public function getAnimationCount():int {
			return _anis.length;
		}
		
		public function getAnimation(aniIndex:int):* {
			return _anis[aniIndex];
		}
		
		public function getAniDuration(aniIndex:int):int {
			return _anis[aniIndex].playTime;
		}
		
		//TODO:coverage
		public function getNodes(aniIndex:int):* {
			return _anis[aniIndex].nodes;
		}
		
		public function getNodeIndexWithName(aniIndex:int, name:String):int {
			return _anis[aniIndex].bone3DMap[name];
		}
		
		public function getNodeCount(aniIndex:int):int {
			return _anis[aniIndex].nodes.length;
		}
		
		public function getTotalkeyframesLength(aniIndex:int):int {
			return _anis[aniIndex].totalKeyframeDatasLength;
		}
		
		public function getPublicExtData():ArrayBuffer {
			return _publicExtData;
		}
		
		//TODO:coverage
		public function getAnimationDataWithCache(key:*, cacheDatas:*, aniIndex:int, frameIndex:int):Float32Array {
			var aniDatas:Object = cacheDatas[aniIndex];
			if (!aniDatas) {
				return null;
			} else {
				var keyDatas:Array = aniDatas[key];
				if (!keyDatas)
					return null;
				else {
					return keyDatas[frameIndex];
				}
			}
		}
		
		//TODO:coverage
		public function setAnimationDataWithCache(key:*, cacheDatas:Array, aniIndex:int, frameIndex:Number, data:*):void {
			var aniDatas:Object = (cacheDatas[aniIndex]) || (cacheDatas[aniIndex] = {});
			var aniDatasCache:Array = (aniDatas[key]) || (aniDatas[key] = []);
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
		public function getNodeKeyFrame(nodeframes:Vector.<KeyFramesContent>, nodeid:int, tm:Number):int {
			var cid:* = _boneCurKeyFrm[nodeid];
			var frmNum:int = nodeframes.length;
			
			if (cid==void 0 || cid>=frmNum) {
				cid = _boneCurKeyFrm[nodeid] = 0;
			}
			
			var kinfo:KeyFramesContent = nodeframes[cid];
			
			var curFrmTm:int = kinfo.startTime;
			var dt:int = tm - curFrmTm;
			// 缓存命中的情况
			if (dt == 0 || (dt > 0 && kinfo.duration > dt)) { 
				return cid;
			}
			// 否则就要前后判断在第几帧
			var i:int = 0;
			if (dt > 0) {
				// 在后面
				tm = tm + 0.01;// 有个问题，由于浮点精度的问题可能导致 前后 st+duration  st+duration 接不上。导致cid+1的起始时间>tm，所以时间加上一点
				for (i = cid+1; i < frmNum; i++) {
					kinfo = nodeframes[i];
					if (kinfo.startTime <= tm && kinfo.startTime+kinfo.duration > tm) {
						_boneCurKeyFrm[nodeid] = i;
						return i;
					}
				}
				return frmNum - 1;
			}else {
				// 在前面
				for (i = 0; i < cid; i++) {
					kinfo = nodeframes[i];
					if (kinfo.startTime <= tm && kinfo.startTime+kinfo.duration > tm) {
						_boneCurKeyFrm[nodeid] = i;
						return i;
					}
				}
				return cid;	// 可能误差导致，返回最后一个
			}
			return 0;	// 这个怎么做
		}
		
		/**
		 * 
		 * @param	aniIndex
		 * @param	originalData
		 * @param	nodesFrameIndices
		 * @param	frameIndex
		 * @param	playCurTime
		 */
		public function getOriginalData(aniIndex:int, originalData:Float32Array, nodesFrameIndices:Array, frameIndex:int, playCurTime:Number):void {
			var oneAni:AnimationContent = _anis[aniIndex];
			
			var nodes:Vector.<AnimationNodeContent> = oneAni.nodes;
			
			// 当前帧缓存数组可能大小需要调整
			var curKFrm:Array = _boneCurKeyFrm;
			if ( curKFrm.length < nodes.length) {
				curKFrm.length = nodes.length;
			}
			//playCurTime %= oneAni.playTime;
			var j:int = 0;
			for (var i:int = 0, n:int = nodes.length, outOfs:int = 0; i < n; i++) {
				var node:AnimationNodeContent = nodes[i];
				
				var key:KeyFramesContent;
				//key = node.keyFrame[nodesFrameIndices[i][frameIndex]];
				var  kfrm:Vector.<KeyFramesContent> = node.keyFrame;
				key = kfrm[ getNodeKeyFrame(kfrm,i,playCurTime) ];
				
				node.dataOffset = outOfs;
				
				var dt:Number = playCurTime - key.startTime;
				
				var lerpType:int = node.lerpType;
				if (lerpType) {
					switch (lerpType) {
					case 0: 
					case 1: 
						for (j = 0; j < node.keyframeWidth; )
							j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
						break;
					case 2: 
						var interpolationData:Array = key.interpolationData;
						var interDataLen:int = interpolationData.length;
						var dataIndex:int = 0;
						for (j = 0; j < interDataLen; ) {
							var type:int = interpolationData[j];
							switch (type) {
							case 6: 
								j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
								break;
							case 7: 
								j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
								break;
							default: 
								j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
								
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
					for (j = 0; j < node.keyframeWidth; )
						j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
				}
				
				outOfs += node.keyframeWidth;
			}
		}
		
		//TODO:coverage
		public function getNodesCurrentFrameIndex(aniIndex:int, playCurTime:Number):Uint32Array {
			var ani:AnimationContent = _anis[aniIndex];
			var nodes:Vector.<AnimationNodeContent> = ani.nodes;
			
			if (aniIndex !== unfixedLastAniIndex) {
				unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
				unfixedCurrentTimes = new Float32Array(nodes.length);
				unfixedLastAniIndex = aniIndex;
			}
			
			for (var i:int = 0, n:int = nodes.length, outOfs:int = 0; i < n; i++) {
				var node:AnimationNodeContent = nodes[i];
				if (playCurTime < unfixedCurrentTimes[i])
					unfixedCurrentFrameIndexes[i] = 0;
				unfixedCurrentTimes[i] = playCurTime;
				
				while ((unfixedCurrentFrameIndexes[i] < node.keyFrame.length)) {
					if (node.keyFrame[unfixedCurrentFrameIndexes[i]].startTime > unfixedCurrentTimes[i])
						break;
					
					unfixedCurrentFrameIndexes[i]++;
				}
				unfixedCurrentFrameIndexes[i]--;
			}
			return unfixedCurrentFrameIndexes;
		}
		
		//TODO:coverage
		public function getOriginalDataUnfixedRate(aniIndex:int, originalData:Float32Array, playCurTime:Number):void {
			var oneAni:AnimationContent = _anis[aniIndex];
			
			var nodes:Vector.<AnimationNodeContent> = oneAni.nodes;
			
			if (aniIndex !== unfixedLastAniIndex) {
				unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
				unfixedCurrentTimes = new Float32Array(nodes.length);
				unfixedKeyframes = new Vector.<KeyFramesContent>(nodes.length);
				unfixedLastAniIndex = aniIndex;
			}
			
			var j:int = 0;
			for (var i:int = 0, n:int = nodes.length, outOfs:int = 0; i < n; i++) {
				var node:AnimationNodeContent = nodes[i];
				
				if (playCurTime < unfixedCurrentTimes[i])
					unfixedCurrentFrameIndexes[i] = 0;
				
				unfixedCurrentTimes[i] = playCurTime;
				
				while (unfixedCurrentFrameIndexes[i] < node.keyFrame.length) {
					if (node.keyFrame[unfixedCurrentFrameIndexes[i]].startTime > unfixedCurrentTimes[i])
						break;
					
					unfixedKeyframes[i] = node.keyFrame[unfixedCurrentFrameIndexes[i]];
					unfixedCurrentFrameIndexes[i]++;
				}
				
				var key:KeyFramesContent = unfixedKeyframes[i];
				node.dataOffset = outOfs;
				var dt:Number = playCurTime - key.startTime;
				var lerpType:int = node.lerpType;
				if (lerpType) {
					switch (node.lerpType) {
					case 0: 
					case 1: 
						for (j = 0; j < node.keyframeWidth; )
							j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
						break;
					case 2: 
						var interpolationData:Array = key.interpolationData;
						var interDataLen:int = interpolationData.length;
						var dataIndex:int = 0;
						for (j = 0; j < interDataLen; ) {
							var type:int = interpolationData[j];
							switch (type) {
							case 6: 
								j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
								break;
							case 7: 
								j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
								break;
							default: 
								j += interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
								
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
					for (j = 0; j < node.keyframeWidth; )
						j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
				}
				
				outOfs += node.keyframeWidth;
			}
		}
	}
}

