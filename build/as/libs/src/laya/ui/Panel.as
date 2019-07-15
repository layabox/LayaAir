/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Box;
	improt laya.ui.VScrollBar;
	improt laya.ui.HScrollBar;
	improt laya.ui.ScrollBar;
	improt laya.display.Node;
	improt laya.display.Sprite;
	public class Panel extends laya.ui.Box {
		protected var _content:Box;
		protected var _vScrollBar:VScrollBar;
		protected var _hScrollBar:HScrollBar;
		protected var _scrollChanged:Boolean;
		protected var _usedCache:String;
		protected var _elasticEnabled:Boolean;

		public function Panel(){}
		public function destroy(destroyChild:Boolean = null):void{}
		public function destroyChildren():void{}
		protected function createChildren():void{}
		public function addChild(child:Node):Node{}
		private var onResize:*;
		public function addChildAt(child:Node,index:Number):Node{}
		public function removeChild(child:Node):Node{}
		public function removeChildAt(index:Number):Node{}
		public function removeChildren(beginIndex:Number = null,endIndex:Number = null):Node{}
		public function getChildAt(index:Number):Node{}
		public function getChildByName(name:String):Node{}
		public function getChildIndex(child:Node):Number{}
		public function get numChildren():Number{};
		private var changeScroll:*;
		protected function _sizeChanged():void{}
		public function get contentWidth():Number{};
		public function get contentHeight():Number{};
		private var setContentSize:*;
		public var width:Number;
		public var height:Number;
		public var vScrollBarSkin:String;
		public var hScrollBarSkin:String;
		public function get vScrollBar():ScrollBar{};
		public function get hScrollBar():ScrollBar{};
		public function get content():Sprite{};
		protected function onScrollBarChange(scrollBar:ScrollBar):void{}
		public function scrollTo(x:Number = null,y:Number = null):void{}
		public function refresh():void{}
		public var cacheAs:String;
		public var elasticEnabled:Boolean;
		private var onScrollStart:*;
		private var onScrollEnd:*;
		protected function _setScrollChanged():void{}
	}

}
