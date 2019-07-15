/*[IF-FLASH]*/
package laya.utils {
	improt laya.events.EventDispatcher;
	public class TimeLine extends laya.events.EventDispatcher {
		private var _labelDic:*;
		private var _tweenDic:*;
		private var _tweenDataList:*;
		private var _endTweenDataList:*;
		private var _currTime:*;
		private var _lastTime:*;
		private var _startTime:*;
		private var _index:*;
		private var _gidIndex:*;
		private var _firstTweenDic:*;
		private var _startTimeSort:*;
		private var _endTimeSort:*;
		private var _loopKey:*;
		public var scale:Number;
		private var _frameRate:*;
		private var _frameIndex:*;
		private var _total:*;
		public static function to(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{}
		public static function from(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{}
		public function to(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{}
		public function from(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{}
		private var _create:*;
		public function addLabel(label:String,offset:Number):TimeLine{}
		public function removeLabel(label:String):void{}
		public function gotoTime(time:Number):void{}
		public function gotoLabel(Label:String):void{}
		public function pause():void{}
		public function resume():void{}
		public function play(timeOrLabel:* = null,loop:Boolean = null):void{}
		private var _update:*;
		private var _animComplete:*;
		private var _complete:*;
		public var index:Number;
		public function get total():Number{};
		public function reset():void{}
		public function destroy():void{}
	}

}
