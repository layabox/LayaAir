/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class SaveCmd {
		public static var ID:String;
		public static function create():SaveCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
