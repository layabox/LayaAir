/*[IF-FLASH]*/
package laya.utils {
	public class Log {
		private static var _logdiv:*;
		private static var _btn:*;
		private static var _count:*;
		public static var maxCount:Number;
		public static var autoScrollToBottom:Boolean;
		public static function enable():void{}
		public static function toggle():void{}
		public static function print(value:String):void{}
		public static function clear():void{}
	}

}
