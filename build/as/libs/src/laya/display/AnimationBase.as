/*[IF-FLASH]*/
package laya.display {
	improt laya.display.Sprite;
	public class AnimationBase extends laya.display.Sprite {
		public static var WRAP_POSITIVE:Number;
		public static var WRAP_REVERSE:Number;
		public static var WRAP_PINGPONG:Number;
		public var loop:Boolean;
		public var wrapMode:Number;
		protected var _interval:Number;
		protected var _index:Number;
		protected var _count:Number;
		protected var _isPlaying:Boolean;
		protected var _labels:*;
		protected var _isReverse:Boolean;
		protected var _frameRateChanged:Boolean;
		protected var _actionName:String;
		private var _controlNode:*;

		public function AnimationBase(){}
		public function play(start:* = null,loop:Boolean = null,name:String = null):void{}
		public var interval:Number;
		protected function _getFrameByLabel(label:String):Number{}
		protected function _frameLoop():void{}
		protected function _resumePlay():void{}
		public function stop():void{}
		public function get isPlaying():Boolean{};
		public function addLabel(label:String,index:Number):void{}
		public function removeLabel(label:String):void{}
		private var _removeLabelFromList:*;
		public function gotoAndStop(position:*):void{}
		public var index:Number;
		protected function _displayToIndex(value:Number):void{}
		public function get count():Number{};
		public function clear():AnimationBase{}
	}

}
