package laya.ui {
	import laya.ui.Box;
	import laya.display.Node;

	/**
	 * <code>LayoutBox</code> 是一个布局容器类。
	 */
	public class LayoutBox extends Box {

		/**
		 * @private 
		 */
		protected var _space:Number;

		/**
		 * @private 
		 */
		protected var _align:String;

		/**
		 * @private 
		 */
		protected var _itemChanged:Boolean;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function addChild(child:Node):Node{
			return null;
		}
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
		override public function removeChildAt(index:Number):Node{
			return null;
		}

		/**
		 * 刷新。
		 */
		public function refresh():void{}

		/**
		 * 改变子对象的布局。
		 */
		protected function changeItems():void{}

		/**
		 * 子对象的间隔。
		 */
		public var space:Number;

		/**
		 * 子对象对齐方式。
		 */
		public var align:String;

		/**
		 * 排序项目列表。可通过重写改变默认排序规则。
		 * @param items 项目列表。
		 */
		protected function sortItem(items:Array):void{}
		protected function _setItemChanged():void{}
	}

}
