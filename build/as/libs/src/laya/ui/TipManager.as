/*[IF-FLASH]*/
package laya.ui {
	improt laya.display.Sprite;
	improt laya.ui.UIComponent;
	public class TipManager extends laya.ui.UIComponent {
		public static var offsetX:Number;
		public static var offsetY:Number;
		public static var tipTextColor:String;
		public static var tipBackColor:String;
		public static var tipDelay:Number;
		private var _tipBox:*;
		private var _tipText:*;
		private var _defaultTipHandler:*;

		public function TipManager(){}
		private var _onStageHideTip:*;
		private var _onStageShowTip:*;
		private var _showTip:*;
		private var _onStageMouseDown:*;
		private var _onStageMouseMove:*;
		private var _showToStage:*;
		public function closeAll():void{}
		public function showDislayTip(tip:Sprite):void{}
		private var _showDefaultTip:*;
		public var defaultTipHandler:Function;
	}

}
