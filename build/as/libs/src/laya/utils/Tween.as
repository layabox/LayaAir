/*[IF-FLASH]*/
package laya.utils {
	improt laya.utils.Handler;
	public class Tween {
		private static var tweenMap:*;
		private var _complete:*;
		private var _target:*;
		private var _ease:*;
		private var _props:*;
		private var _duration:*;
		private var _delay:*;
		private var _startTimer:*;
		private var _usedTimer:*;
		private var _usedPool:*;
		private var _delayParam:*;
		public var gid:Number;
		public var update:Handler;
		public var repeat:Number;
		private var _count:*;
		public static function to(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null,autoRecover:Boolean = null):Tween{}
		public static function from(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null,autoRecover:Boolean = null):Tween{}
		public function to(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null):Tween{}
		public function from(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null):Tween{}
		private var firstStart:*;
		private var _initProps:*;
		private var _beginLoop:*;
		private var _doEase:*;
		public var progress:Number;
		public function complete():void{}
		public function pause():void{}
		public function setStartTime(startTime:Number):void{}
		public static function clearAll(target:*):void{}
		public static function clear(tween:Tween):void{}
		public static function clearTween(target:*):void{}
		public function clear():void{}
		public function recover():void{}
		private var _remove:*;
		public function restart():void{}
		public function resume():void{}
		private static var easeNone:*;
	}

}
