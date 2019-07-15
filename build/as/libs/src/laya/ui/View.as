/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Widget;
	improt laya.display.Scene;
	public class View extends laya.display.Scene {
		public static var uiMap:*;
		protected var _widget:Widget;
		protected var _dataSource:*;
		protected var _anchorX:Number;
		protected var _anchorY:Number;
		public static function __init__():void{}

		public function View(){}
		public static function regComponent(key:String,compClass:Class):void{}
		public static function regUI(url:String,json:*):void{}
		public function destroy(destroyChild:Boolean = null):void{}
		public function changeData(key:String):void{}
		public var top:Number;
		public var bottom:Number;
		public var left:Number;
		public var right:Number;
		public var centerX:Number;
		public var centerY:Number;
		public var anchorX:Number;
		public var anchorY:Number;
		protected function _sizeChanged():void{}
		private var _getWidget:*;
		protected function loadUI(path:String):void{}
		public var dataSource:*;
	}

}
