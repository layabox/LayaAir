/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class RestoreCmd {
		public static var ID:String;
		public static function create():RestoreCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
