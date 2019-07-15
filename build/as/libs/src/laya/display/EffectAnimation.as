/*[IF-FLASH]*/
package laya.display {
	improt laya.display.FrameAnimation;
	public class EffectAnimation extends laya.display.FrameAnimation {
		private static var EFFECT_BEGIN:*;
		private var _target:*;
		private var _playEvent:*;
		private var _initData:*;
		private var _aniKeys:*;
		private var _effectClass:*;
		public var target:*;
		private var _onOtherBegin:*;
		public var playEvent:String;
		private var _addEvent:*;
		private var _onPlayAction:*;
		public function play(start:* = null,loop:Boolean = null,name:String = null):void{}
		private var _recordInitData:*;
		public var effectClass:String;
		public var effectData:*;
		protected function _displayToIndex(value:Number):void{}
		protected function _displayNodeToFrame(node:*,frame:Number,targetDic:* = null):void{}
		protected function _calculateKeyFrames(node:*):void{}
	}

}
