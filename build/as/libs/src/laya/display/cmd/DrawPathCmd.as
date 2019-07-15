/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class DrawPathCmd {
		public static var ID:String;
		public var x:Number;
		public var y:Number;
		public var paths:Array;
		public var brush:*;
		public var pen:*;
		public static function create(x:Number,y:Number,paths:Array,brush:*,pen:*):DrawPathCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
