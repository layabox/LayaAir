/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class TranslateCmd {
		public static var ID:String;
		public var tx:Number;
		public var ty:Number;
		public static function create(tx:Number,ty:Number):TranslateCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
