/*[IF-FLASH]*/
package laya.utils {
	public class Timer {
		public static var gSysTimer:Timer;
		private static var _pool:*;
		public static var _mid:Number;
		public var scale:Number;
		public var currTimer:Number;
		public var currFrame:Number;
		private var _map:*;
		private var _handlers:*;
		private var _temp:*;
		private var _count:*;

		public function Timer(autoActive:Boolean = null){}
		public function get delta():Number{};
		private var _clearHandlers:*;
		private var _recoverHandler:*;
		private var _indexHandler:*;
		public function once(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}
		public function loop(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null,jumpFrame:Boolean = null):void{}
		public function frameOnce(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}
		public function frameLoop(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}
		public function toString():String{}
		public function clear(caller:*,method:Function):void{}
		public function clearAll(caller:*):void{}
		private var _getHandler:*;
		public function callLater(caller:*,method:Function,args:Array = null):void{}
		public function runCallLater(caller:*,method:Function):void{}
		public function runTimer(caller:*,method:Function):void{}
		public function pause():void{}
		public function resume():void{}
	}

}
