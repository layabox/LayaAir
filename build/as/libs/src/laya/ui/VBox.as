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
		 * @inheritDoc 
		 * @override 
		 */
		override protected function changeItems():void{}
	}

}
