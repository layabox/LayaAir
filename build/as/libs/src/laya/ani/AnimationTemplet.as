package laya.ani {
	import laya.ani.KeyFramesContent;
	import laya.resource.Resource;

	/**
	 * <code>AnimationTemplet</code> 类用于动画模板资源。
	 */
	public class AnimationTemplet extends Resource {
		public static var interpolation:Array;

		/**
		 * @private 
		 */
		private static var _LinearInterpolation_0:*;

		/**
		 * @private 
		 */
		private static var _QuaternionInterpolation_1:*;

		/**
		 * @private 
		 */
		private static var _AngleInterpolation_2:*;

		/**
		 * @private 
		 */
		private static var _RadiansInterpolation_3:*;

		/**
		 * @private 
		 */
		private static var _Matrix4x4Interpolation_4:*;

		/**
		 * @private 
		 */
		private static var _NoInterpolation_5:*;

		/**
		 * @private 
		 */
		private static var _BezierInterpolation_6:*;

		/**
		 * @private 
		 */
		private static var _BezierInterpolation_7:*;

		/**
		 * @private 
		 */
		protected var unfixedCurrentFrameIndexes:Uint32Array;

		/**
		 * @private 
		 */
		protected var unfixedCurrentTimes:Float32Array;

		/**
		 * @private 
		 */
		protected var unfixedKeyframes:Array;

		/**
		 * @private 
		 */
		protected var unfixedLastAniIndex:Number;

		/**
		 * @private 
		 */
		private var _boneCurKeyFrm:*;

		public function AnimationTemplet(){}

		/**
		 * @private 
		 */
		public function parse(data:ArrayBuffer):void{}
		public function getAnimationCount():Number{
			return null;
		}
		public function getAnimation(aniIndex:Number):*{}
		public function getAniDuration(aniIndex:Number):Number{
			return null;
		}
		public function getNodes(aniIndex:Number):*{}
		public function getNodeIndexWithName(aniIndex:Number,name:String):Number{
			return null;
		}
		public function getNodeCount(aniIndex:Number):Number{
			return null;
		}
		public function getTotalkeyframesLength(aniIndex:Number):Number{
			return null;
		}
		public function getPublicExtData():ArrayBuffer{
			return null;
		}
		public function getAnimationDataWithCache(key:*,cacheDatas:*,aniIndex:Number,frameIndex:Number):Float32Array{
			return null;
		}
		public function setAnimationDataWithCache(key:*,cacheDatas:Array,aniIndex:Number,frameIndex:Number,data:*):void{}

		/**
		 * 计算当前时间应该对应关键帧的哪一帧
		 * @param nodeframes 当前骨骼的关键帧数据
		 * @param nodeid 骨骼id，因为要使用和更新 _boneCurKeyFrm
		 * @param tm 
		 * @return 问题	最后一帧有问题，例如倒数第二帧时间是0.033ms,则后两帧非常靠近，当实际给最后一帧的时候，根据帧数计算出的时间实际上落在倒数第二帧 	使用与AnimationPlayer一致的累积时间就行
		 */
		public function getNodeKeyFrame(nodeframes:Array,nodeid:Number,tm:Number):Number{
			return null;
		}

		/**
		 * @param aniIndex 
		 * @param originalData 
		 * @param nodesFrameIndices 
		 * @param frameIndex 
		 * @param playCurTime 
		 */
		public function getOriginalData(aniIndex:Number,originalData:Float32Array,nodesFrameIndices:Array,frameIndex:Number,playCurTime:Number):void{}
		public function getNodesCurrentFrameIndex(aniIndex:Number,playCurTime:Number):Uint32Array{
			return null;
		}
		public function getOriginalDataUnfixedRate(aniIndex:Number,originalData:Float32Array,playCurTime:Number):void{}
	}

}
