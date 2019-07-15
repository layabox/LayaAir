/*[IF-FLASH]*/
package laya.display.css {
	improt laya.display.css.SpriteStyle;
	improt laya.display.BitmapFont;
	improt laya.display.Sprite;
	improt laya.resource.Context;
	public class TextStyle extends laya.display.css.SpriteStyle {
		public static var EMPTY:TextStyle;
		public var italic:Boolean;
		public var align:String;
		public var wordWrap:Boolean;
		public var leading:Number;
		public var padding:Array;
		public var bgColor:String;
		public var borderColor:String;
		public var asPassword:Boolean;
		public var stroke:Number;
		public var strokeColor:String;
		public var bold:Boolean;
		public var underline:Boolean;
		public var underlineColor:String;
		public var currBitmapFont:BitmapFont;
		public function reset():SpriteStyle{}
		public function recover():void{}
		public static function create():TextStyle{}
		public function render(sprite:Sprite,context:Context,x:Number,y:Number):void{}
	}

}
