package laya.ui {
	import laya.ui.LayoutBox;

	/**
	 * <code>VBox</code> 是一个垂直布局容器类。
	 */
	public class VBox extends LayoutBox {

		/**
		 * 无对齐。
		 */
		public static var NONE:String;

		/**
		 * 左对齐。
		 */
		public static var LEFT:String;

		/**
		 * 居中对齐。
		 */
		public static var CENTER:String;

		/**
		 * 右对齐。
		 */
		public static var RIGHT:String;

		/**
		 * @override 
		 */
		override public function set width(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get width():Number{return null;}

		/**
		 * 兼容以前的changeItems逻辑，是否在发生变动时，使用 sortItem 排序所有item
		 */
		public var isSortItem:Boolean;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function changeItems():void{}
	}

}
