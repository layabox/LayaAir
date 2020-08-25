package laya.display.css {
	import laya.maths.Rectangle;
	import laya.utils.Dragging;

	/**
	 * 元素样式
	 */
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

		/**
		 * 重置，方便下次复用
		 */
		public function reset():SpriteStyle{
			return null;
		}

		/**
		 * 回收
		 */
		public function recover():void{}

		/**
		 * 从对象池中创建
		 */
		public static function create():SpriteStyle{
			return null;
		}
	}

}
