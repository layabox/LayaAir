/*[IF-FLASH]*/
package laya.display {
	improt laya.display.AnimationBase;
	public class FrameAnimation extends laya.display.AnimationBase {
		private static var _sortIndexFun:*;
		public var _targetDic:*;
		public var _animationData:*;
		protected var _usedFrames:Array;

		public function FrameAnimation(){}
		public function clear():AnimationBase{}
		protected function _displayToIndex(value:Number):void{}
		protected function _displayNodeToFrame(node:*,frame:Number,targetDic:* = null):void{}
		private var _calculateDatas:*;
		protected function _calculateKeyFrames(node:*):void{}
		public function resetNodes():void{}
		private var _calculateNodePropFrames:*;
		private var _dealKeyFrame:*;
		private var _calculateFrameValues:*;
	}

}
