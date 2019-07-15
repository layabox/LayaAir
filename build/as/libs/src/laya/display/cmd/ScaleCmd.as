/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class ScaleCmd {
		public static var ID:String;
		public var scaleX:Number;
		public var scaleY:Number;
		public var pivotX:Number;
		public var pivotY:Number;
		public static function create(scaleX:Number,scaleY:Number,pivotX:Number,pivotY:Number):ScaleCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
