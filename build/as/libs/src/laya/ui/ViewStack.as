package laya.ui {
	import laya.ui.IItem;
	import laya.display.Node;
	import laya.ui.Box;
	import laya.utils.Handler;

	/**
	 * <code>ViewStack</code> 类用于视图堆栈类，用于视图的显示等设置处理。
	 */
	public class ViewStack extends Box implements IItem {

		/**
		 * @private 
		 */
		protected var _items:Array;

		/**
		 * @private 
		 */
		protected var _setIndexHandler:Handler;

		/**
		 * @private 
		 */
		protected var _selectedIndex:Number;

		/**
		 * 批量设置视图对象。
		 * @param views 视图对象数组。
		 */
		public function setItems(views:Array):void{}

		/**
		 * 添加视图。
		 * 添加视图对象，并设置此视图对象的<code>name</code> 属性。
		 * @param view 需要添加的视图对象。
		 */
		public function addItem(view:Node):void{}

		/**
		 * 初始化视图对象集合。
		 */
		public function initItems():void{}

		/**
		 * 表示当前视图索引。
		 */
		public var selectedIndex:Number;

		/**
		 * @private 通过对象的索引设置项对象的 <code>selected</code> 属性值。
		 * @param index 需要设置的对象的索引。
		 * @param selected 表示对象的选中状态。
		 */
		protected function setSelect(index:Number,selected:Boolean):void{}

		/**
		 * 获取或设置当前选择的项对象。
		 */
		public var selection:Node;

		/**
		 * 索引设置处理器。
		 * <p>默认回调参数：index:int</p>
		 */
		public var setIndexHandler:Handler;

		/**
		 * @private 设置属性<code>selectedIndex</code>的值。
		 * @param index 选中项索引值。
		 */
		protected function setIndex(index:Number):void{}

		/**
		 * 视图集合数组。
		 */
		public function get items():Array{
				return null;
		}
	}

}
