/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class AlphaCmd {
		public static var ID:String;
		public var alpha:Number;
		public static function create(alpha:Number):AlphaCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
