/*[IF-FLASH]*/
package laya.events {
	public class EventDispatcher {
		public static var MOUSE_EVENTS:*;
		private var _events:*;
		public function hasListener(type:String):Boolean{}
		public function event(type:String,data:* = null):Boolean{}
		public function on(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		public function once(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		public function off(type:String,caller:*,listener:Function,onceOnly:Boolean = null):EventDispatcher{}
		public function offAll(type:String = null):EventDispatcher{}
		public function offAllCaller(caller:*):EventDispatcher{}
		private var _recoverHandlers:*;
		public function isMouseEvent(type:String):Boolean{}
	}

}
