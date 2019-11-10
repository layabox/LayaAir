package laya.ui {
	import laya.display.Sprite;
	import laya.ui.UIComponent;

	/**
	 * 鼠标提示管理类
	 */
	public class TipManager extends UIComponent {
		public static var offsetX:Number;
		public static var offsetY:Number;
		public static var tipTextColor:String;
		public static var tipBackColor:String;
		public static var tipDelay:Number;
		private var _tipBox:*;
		private var _tipText:*;
		private var _defaultTipHandler:*;

		public function TipManager(){}

		/**
		 * @private 
		 */
		private var _onStageHideTip:*;

		/**
		 * @private 
		 */
		private var _onStageShowTip:*;

		/**
		 * @private 
		 */
		private var _showTip:*;

		/**
		 * @private 
		 */
		private var _onStageMouseDown:*;

		/**
		 * @private 
		 */
		private var _onStageMouseMove:*;

		/**
		 * @private 
		 */
		private var _showToStage:*;

		/**
		 * 关闭所有鼠标提示
		 */
		public function closeAll():void{}

		/**
		 * 显示显示对象类型的tip
		 */
		public function showDislayTip(tip:Sprite):void{}

		/**
		 * @private 
		 */
		private var _showDefaultTip:*;

		/**
		 * 默认鼠标提示函数
		 */
		public var defaultTipHandler:Function;
	}

}
