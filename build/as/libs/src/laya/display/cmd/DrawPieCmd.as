/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class DrawPieCmd {
		public static var ID:String;
		public var x:Number;
		public var y:Number;
		public var radius:Number;
		private var _startAngle:*;
		private var _endAngle:*;
		public var fillColor:*;
		public var lineColor:*;
		public var lineWidth:Number;
		public var vid:Number;
		public static function create(x:Number,y:Number,radius:Number,startAngle:Number,endAngle:Number,fillColor:*,lineColor:*,lineWidth:Number,vid:Number):DrawPieCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
		public var startAngle:Number;
		public var endAngle:Number;
	}

}
