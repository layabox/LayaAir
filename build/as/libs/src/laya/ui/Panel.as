package laya.ui {
	import laya.ui.Box;
	import laya.ui.VScrollBar;
	import laya.ui.HScrollBar;
	import laya.ui.ScrollBar;
	import laya.display.Node;
	import laya.display.Sprite;

	/**
	 * <code>Panel</code> 是一个面板容器类。
	 */
	public class Panel extends Box {

		/**
		 * @private 
		 */
		protected var _content:Box;

		/**
		 * @private 
		 */
		protected var _vScrollBar:VScrollBar;

		/**
		 * @private 
		 */
		protected var _hScrollBar:HScrollBar;

		/**
		 * @private 
		 */
		protected var _scrollChanged:Boolean;

		/**
		 * @private 
		 */
		protected var _usedCache:String;

		/**
		 * @private 
		 */
		protected var _elasticEnabled:Boolean;

		/**
		 * 创建一个新的 <code>Panel</code> 类实例。
		 * <p>在 <code>Panel</code> 构造函数中设置属性width、height的值都为100。</p>
		 */

		public function Panel(){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroyChildren():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function createChildren():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function addChild(child:Node):Node{
			return null;
		}

		/**
		 * @private 子对象的 <code>Event.RESIZE</code> 事件侦听处理函数。
		 */
		private var onResize:*;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function addChildAt(child:Node,index:Number):Node{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function removeChild(child:Node):Node{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function removeChildAt(index:Number):Node{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function removeChildren(beginIndex:Number = null,endIndex:Number = null):Node{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function getChildAt(index:Number):Node{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function getChildByName(name:String):Node{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function getChildIndex(child:Node):Number{
			return null;
		}

		/**
		 * @private 
		 */
		private var changeScroll:*;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _sizeChanged():void{}

		/**
		 * @private 获取内容宽度（以像素为单位）。
		 */
		public function get contentWidth():Number{
				return null;
		}

		/**
		 * @private 获取内容高度（以像素为单位）。
		 */
		public function get contentHeight():Number{
				return null;
		}

		/**
		 * @private 设置内容的宽度、高度（以像素为单位）。
		 * @param width 宽度。
		 * @param height 高度。
		 */
		private var setContentSize:*;

		/**
		 * 垂直方向滚动条皮肤。
		 */
		public var vScrollBarSkin:String;

		/**
		 * 水平方向滚动条皮肤。
		 */
		public var hScrollBarSkin:String;

		/**
		 * 垂直方向滚动条对象。
		 */
		public function get vScrollBar():ScrollBar{
				return null;
		}

		/**
		 * 水平方向滚动条对象。
		 */
		public function get hScrollBar():ScrollBar{
				return null;
		}

		/**
		 * 获取内容容器对象。
		 */
		public function get content():Sprite{
				return null;
		}

		/**
		 * @private 滚动条的<code><code>Event.MOUSE_DOWN</code>事件侦听处理函数。</code>事件侦听处理函数。
		 * @param scrollBar 滚动条对象。
		 * @param e Event 对象。
		 */
		protected function onScrollBarChange(scrollBar:ScrollBar):void{}

		/**
		 * <p>滚动内容容器至设定的垂直、水平方向滚动条位置。</p>
		 * @param x 水平方向滚动条属性value值。滚动条位置数字。
		 * @param y 垂直方向滚动条属性value值。滚动条位置数字。
		 */
		public function scrollTo(x:Number = null,y:Number = null):void{}

		/**
		 * 刷新滚动内容。
		 */
		public function refresh():void{}

		/**
		 * 是否开启橡皮筋效果
		 */
		public var elasticEnabled:Boolean;
		private var onScrollStart:*;
		private var onScrollEnd:*;

		/**
		 * @private 
		 */
		protected function _setScrollChanged():void{}
	}

}
