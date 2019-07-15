/*[IF-FLASH]*/
package laya.display.css {
	improt laya.maths.Rectangle;
	improt laya.utils.Dragging;
	public class SpriteStyle {
		public static var EMPTY:SpriteStyle;
		public var scaleX:Number;
		public var scaleY:Number;
		public var skewX:Number;
		public var skewY:Number;
		public var pivotX:Number;
		public var pivotY:Number;
		public var rotation:Number;
		public var alpha:Number;
		public var scrollRect:Rectangle;
		public var viewport:Rectangle;
		public var hitArea:*;
		public var dragging:Dragging;
		public var blendMode:String;

		public function SpriteStyle(){}
		public function reset():SpriteStyle{}
		public function recover():void{}
		public static function create():SpriteStyle{}
	}

}
