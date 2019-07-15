/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class DrawLinesCmd {
		public static var ID:String;
		public var x:Number;
		public var y:Number;
		public var points:Array;
		public var lineColor:*;
		public var lineWidth:Number;
		public var vid:Number;
		public static function create(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number,vid:Number):DrawLinesCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
