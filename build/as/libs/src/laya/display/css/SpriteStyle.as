package laya.display.css {
	import laya.maths.Rectangle;
	import laya.utils.Dragging;

	/**
	 * 元素样式
	 */
	public class SpriteStyle {
		public static var EMPTY:SpriteStyle;

		/**
		 * 水平缩放
		 */
		public var scaleX:Number;

		/**
		 * 垂直缩放
		 */
		public var scaleY:Number;

		/**
		 * 水平倾斜角度
		 */
		public var skewX:Number;

		/**
		 * 垂直倾斜角度
		 */
		public var skewY:Number;

		/**
		 * X轴心点
		 */
		public var pivotX:Number;

		/**
		 * Y轴心点
		 */
		public var pivotY:Number;

		/**
		 * 旋转角度
		 */
		public var rotation:Number;

		/**
		 * 透明度
		 */
		public var alpha:Number;

		/**
		 * 滚动区域
		 */
		public var scrollRect:Rectangle;

		/**
		 * 视口
		 */
		public var viewport:Rectangle;

		/**
		 * 点击区域
		 */
		public var hitArea:*;

		/**
		 * 滑动
		 */
		public var dragging:Dragging;

		/**
		 * 混合模式
		 */
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
