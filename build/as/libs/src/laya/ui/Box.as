package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.IBox;

	/**
	 * <code>Box</code> 类是一个控件容器类。
	 */
	public class Box extends UIComponent implements IBox {
		private var _bgColor:*;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set dataSource(value:*):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get dataSource():*{return null;}

		/**
		 * 背景颜色
		 */
		public function get bgColor():String{return null;}
		public function set bgColor(value:String):void{}
		private var _onResize:*;
	}

}
