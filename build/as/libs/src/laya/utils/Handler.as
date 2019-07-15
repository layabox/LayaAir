/*[IF-FLASH]*/
package laya.utils {
	public class Handler {
		protected static var _pool:Array;
		private static var _gid:*;
		public var caller:*;
		public var method:Function;
		public var args:Array;
		public var once:Boolean;
		protected var _id:Number;

		public function Handler(caller:* = null,method:Function = null,args:Array = null,once:Boolean = null){}
		public function setTo(caller:*,method:Function,args:Array,once:Boolean):Handler{}
		public function run():*{}
		public function runWith(data:*):*{}
		public function clear():Handler{}
		public function recover():void{}
		public static function create(caller:*,method:Function,args:Array = null,once:Boolean = null):Handler{}
	}

}
