package laya.components {
	import laya.display.Node;
	import laya.resource.IDestroy;
	import laya.resource.ISingletonElement;

	/**
	 * <code>Component</code> 类用于创建组件的基类。
	 */
	public class Component implements ISingletonElement,IDestroy {

		/**
		 * [只读]获取所属Node节点。
		 * @readonly 
		 */
		public var owner:Node;

		/**
		 * 创建一个新的 <code>Component</code> 实例。
		 */

		public function Component(){}

		/**
		 * 唯一标识ID。
		 */
		public function get id():Number{
				return null;
		}

		/**
		 * 是否启用组件。
		 */
		public var enabled:Boolean;

		/**
		 * 是否为单实例组件。
		 */
		public function get isSingleton():Boolean{
				return null;
		}

		/**
		 * 是否已经销毁 。
		 */
		public function get destroyed():Boolean{
				return null;
		}

		/**
		 * [实现IListPool接口]
		 */
		public function _getIndexInList():Number{
			return null;
		}

		/**
		 * [实现IListPool接口]
		 */
		public function _setIndexInList(index:Number):void{}

		/**
		 * 重置组件参数到默认值，如果实现了这个函数，则组件会被重置并且自动回收到对象池，方便下次复用
		 * 如果没有重置，则不进行回收复用
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onReset():void{}

		/**
		 * 销毁组件
		 */
		public function destroy():void{}
	}

}
