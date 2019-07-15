/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class DrawLineCmd {
		public static var ID:String;
		public var fromX:Number;
		public var fromY:Number;
		public var toX:Number;
		public var toY:Number;
		public var lineColor:String;
		public var lineWidth:Number;
		public var vid:Number;
		public static function create(fromX:Number,fromY:Number,toX:Number,toY:Number,lineColor:String,lineWidth:Number,vid:Number):DrawLineCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
