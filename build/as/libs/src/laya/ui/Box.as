package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.IBox;

	/**
	 * <code>Box</code> 类是一个控件容器类。
	 */
	public class Box extends UIComponent implements IBox {
		private var _bgColor:*;

		/**
		 * 背景颜色
		 */
		public var bgColor:String;
		private var _onResize:*;
	}

}
