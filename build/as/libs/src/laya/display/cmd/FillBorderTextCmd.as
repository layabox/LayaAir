/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class FillBorderTextCmd {
		public static var ID:String;
		public var text:String;
		public var x:Number;
		public var y:Number;
		public var font:String;
		public var fillColor:String;
		public var borderColor:String;
		public var lineWidth:Number;
		public var textAlign:String;
		public static function create(text:String,x:Number,y:Number,font:String,fillColor:String,borderColor:String,lineWidth:Number,textAlign:String):FillBorderTextCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
