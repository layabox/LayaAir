/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.IBox;
	public class Box extends laya.ui.UIComponent implements laya.ui.IBox {
		private var _bgColor:*;
		public var dataSource:*;
		public var bgColor:String;
		private var _onResize:*;
	}

}
