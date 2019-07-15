/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class DrawRectCmd {
		public static var ID:String;
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public var fillColor:*;
		public var lineColor:*;
		public var lineWidth:Number;
		public static function create(x:Number,y:Number,width:Number,height:Number,fillColor:*,lineColor:*,lineWidth:Number):DrawRectCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
