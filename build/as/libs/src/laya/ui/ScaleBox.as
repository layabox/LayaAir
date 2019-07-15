/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Box;
	public class ScaleBox extends laya.ui.Box {
		private var _oldW:*;
		private var _oldH:*;
		public function onEnable():void{}
		public function onDisable():void{}
		private var onResize:*;
		public var width:Number;
		public var height:Number;
	}

}
