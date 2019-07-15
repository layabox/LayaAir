/*[IF-FLASH]*/
package laya.ani {
	improt laya.ani.KeyFramesContent;
	improt laya.resource.Resource;
	public class AnimationTemplet extends laya.resource.Resource {
		public static var interpolation:Array;
		private static var _LinearInterpolation_0:*;
		private static var _QuaternionInterpolation_1:*;
		private static var _AngleInterpolation_2:*;
		private static var _RadiansInterpolation_3:*;
		private static var _Matrix4x4Interpolation_4:*;
		private static var _NoInterpolation_5:*;
		private static var _BezierInterpolation_6:*;
		private static var _BezierInterpolation_7:*;
		protected var unfixedCurrentFrameIndexes:Uint32Array;
		protected var unfixedCurrentTimes:Float32Array;
		protected var unfixedKeyframes:Array;
		protected var unfixedLastAniIndex:Number;
		private var _boneCurKeyFrm:*;

		public function AnimationTemplet(){}
		public function parse(data:ArrayBuffer):void{}
		public function getAnimationCount():Number{}
		public function getAnimation(aniIndex:Number):*{}
		public function getAniDuration(aniIndex:Number):Number{}
		public function getNodes(aniIndex:Number):*{}
		public function getNodeIndexWithName(aniIndex:Number,name:String):Number{}
		public function getNodeCount(aniIndex:Number):Number{}
		public function getTotalkeyframesLength(aniIndex:Number):Number{}
		public function getPublicExtData():ArrayBuffer{}
		public function getAnimationDataWithCache(key:*,cacheDatas:*,aniIndex:Number,frameIndex:Number):Float32Array{}
		public function setAnimationDataWithCache(key:*,cacheDatas:Array,aniIndex:Number,frameIndex:Number,data:*):void{}
		public function getNodeKeyFrame(nodeframes:Array,nodeid:Number,tm:Number):Number{}
		public function getOriginalData(aniIndex:Number,originalData:Float32Array,nodesFrameIndices:Array,frameIndex:Number,playCurTime:Number):void{}
		public function getNodesCurrentFrameIndex(aniIndex:Number,playCurTime:Number):Uint32Array{}
		public function getOriginalDataUnfixedRate(aniIndex:Number,originalData:Float32Array,playCurTime:Number):void{}
	}

}
