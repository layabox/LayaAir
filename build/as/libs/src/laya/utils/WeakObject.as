/*[IF-FLASH]*/
package laya.utils {
	public class WeakObject {
		public static var supportWeakMap:Boolean;
		public static var delInterval:Number;
		public static var I:WeakObject;
		private static var _keys:*;
		private static var _maps:*;
		public static function clearCache():void{}

		public function WeakObject(){}
		public function set(key:*,value:*):void{}
		public function get(key:*):*{}
		public function del(key:*):void{}
		public function has(key:*):Boolean{}
	}

}
