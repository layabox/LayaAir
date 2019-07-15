/*[IF-FLASH]*/
package laya.events {
	improt laya.events.Event;
	public class KeyBoardManager {
		private static var _pressKeys:*;
		public static var enabled:Boolean;
		public static var _event:Event;
		public static function __init__():void{}
		private static var _addEvent:*;
		private static var _dispatch:*;
		public static function hasKeyDown(key:Number):Boolean{}
	}

}
