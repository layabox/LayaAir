package laya.ui {
	import laya.utils.Handler;

	/**
	 * <code>ISelect</code> 接口，实现对象的 <code>selected</code> 属性和 <code>clickHandler</code> 选择回调函数处理器。
	 */
	public interface ISelect {

		/**
		 * 一个布尔值，表示是否被选择。
		 */
		function get selected():Boolean;

		/**
		 * 对象的点击事件回掉函数处理器。
		 */
		function get clickHandler():Handler;
	}

}
