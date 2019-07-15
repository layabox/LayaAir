/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class FillBorderWordsCmd {
		public static var ID:String;
		public var words:Array;
		public var x:Number;
		public var y:Number;
		public var font:String;
		public var fillColor:String;
		public var borderColor:String;
		public var lineWidth:Number;
		public static function create(words:Array,x:Number,y:Number,font:String,fillColor:String,borderColor:String,lineWidth:Number):FillBorderWordsCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
