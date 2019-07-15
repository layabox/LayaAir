/*[IF-FLASH]*/
package laya.ui {
	improt laya.components.Component;
	public class Widget extends laya.components.Component {
		public static var EMPTY:Widget;
		private var _top:*;
		private var _bottom:*;
		private var _left:*;
		private var _right:*;
		private var _centerX:*;
		private var _centerY:*;
		public function onReset():void{}
		protected function _onEnable():void{}
		protected function _onDisable():void{}
		protected function _onParentResize():void{}
		public function resetLayoutX():Boolean{}
		public function resetLayoutY():Boolean{}
		public function resetLayout():void{}
		public var top:Number;
		public var bottom:Number;
		public var left:Number;
		public var right:Number;
		public var centerX:Number;
		public var centerY:Number;
	}

}
