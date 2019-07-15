/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class RotateCmd {
		public static var ID:String;
		public var angle:Number;
		public var pivotX:Number;
		public var pivotY:Number;
		public static function create(angle:Number,pivotX:Number,pivotY:Number):RotateCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
