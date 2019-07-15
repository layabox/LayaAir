/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Widget;
	improt laya.display.Node;
	improt laya.display.Sprite;
	public class UIComponent extends laya.display.Sprite {
		protected var _anchorX:Number;
		protected var _anchorY:Number;
		protected var _dataSource:*;
		protected var _toolTip:*;
		protected var _tag:*;
		protected var _disabled:Boolean;
		protected var _gray:Boolean;
		protected var _widget:Widget;

		public function UIComponent(){}
		public function destroy(destroyChild:Boolean = null):void{}
		public var width:Number;
		public function get_width():Number{}
		protected function measureWidth():Number{}
		public var height:Number;
		public function get_height():Number{}
		protected function measureHeight():Number{}
		public var dataSource:*;
		public function get_dataSource():*{}
		public function set_dataSource(value:*):void{}
		public var top:Number;
		public function get_top():Number{}
		public function set_top(value:Number):void{}
		public var bottom:Number;
		public function get_bottom():Number{}
		public function set_bottom(value:Number):void{}
		public var left:Number;
		public var right:Number;
		public var centerX:Number;
		public var centerY:Number;
		protected function _sizeChanged():void{}
		public var toolTip:*;
		private var onMouseOver:*;
		private var onMouseOut:*;
		public var gray:Boolean;
		public var disabled:Boolean;
		private var _getWidget:*;
		public var scaleX:Number;
		public function set_scaleX(value:Number):void{}
		public var scaleY:Number;
		public function set_scaleY(value:Number):void{}
		protected function onCompResize():void{}
		public function set_width(value:Number):void{}
		public function set_height(value:Number):void{}
		public var anchorX:Number;
		public function get_anchorX():Number{}
		public function set_anchorX(value:Number):void{}
		public var anchorY:Number;
		public function get_anchorY():Number{}
		public function set_anchorY(value:Number):void{}
		protected function _childChanged(child:Node = null):void{}
	}

}
