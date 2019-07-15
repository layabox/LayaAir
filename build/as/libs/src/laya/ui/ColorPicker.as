/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.Box;
	improt laya.ui.Button;
	improt laya.display.Input;
	improt laya.display.Sprite;
	improt laya.utils.Handler;
	public class ColorPicker extends laya.ui.UIComponent {
		public var changeHandler:Handler;
		protected var _gridSize:Number;
		protected var _bgColor:String;
		protected var _borderColor:String;
		protected var _inputColor:String;
		protected var _inputBgColor:String;
		protected var _colorPanel:Box;
		protected var _colorTiles:Sprite;
		protected var _colorBlock:Sprite;
		protected var _colorInput:Input;
		protected var _colorButton:Button;
		protected var _colors:Array;
		protected var _selectedColor:String;
		protected var _panelChanged:Boolean;
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		protected function initialize():void{}
		private var onPanelMouseDown:*;
		protected function changePanel():void{}
		private var onColorButtonClick:*;
		public function open():void{}
		public function close():void{}
		private var removeColorBox:*;
		private var onColorFieldKeyDown:*;
		private var onColorInputChange:*;
		private var onColorTilesClick:*;
		private var onColorTilesMouseMove:*;
		protected function getColorByMouse():String{}
		private var drawBlock:*;
		public var selectedColor:String;
		public var skin:String;
		private var changeColor:*;
		public var bgColor:String;
		public var borderColor:String;
		public var inputColor:String;
		public var inputBgColor:String;
		protected function _setPanelChanged():void{}
	}

}
