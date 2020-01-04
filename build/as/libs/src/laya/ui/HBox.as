package laya.ui {
	import laya.ui.LayoutBox;

	/**
	 * <code>HBox</code> 是一个水平布局容器类。
	 */
	public class HBox extends LayoutBox {

		/**
		 * 无对齐。
		 */
		public static var NONE:String;

		/**
		 * 居顶部对齐。
		 */
		public static var TOP:String;

		/**
		 * 居中对齐。
		 */
		public static var MIDDLE:String;

		/**
		 * 居底部对齐。
		 */
		public static var BOTTOM:String;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function sortItem(items:Array):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function changeItems():void{}
	}

}
