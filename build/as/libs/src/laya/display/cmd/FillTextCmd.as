/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	improt laya.utils.WordText;
	public class FillTextCmd {
		public static var ID:String;
		private var _text:*;
		public var x:Number;
		public var y:Number;
		private var _font:*;
		private var _color:*;
		private var _textAlign:*;
		private var _fontColor:*;
		private var _strokeColor:*;
		private static var _defFontObj:*;
		private var _fontObj:*;
		private var _nTexAlign:*;
		public static function create(text:*,x:Number,y:Number,font:String,color:String,textAlign:String):FillTextCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
		public var text:*;
		public var font:String;
		public var color:String;
		public var textAlign:String;
	}

}
