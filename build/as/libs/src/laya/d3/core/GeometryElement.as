package laya.d3.core {
	import laya.resource.IDestroy;

	/**
	 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
	 */
	public class GeometryElement implements IDestroy {

		/**
		 * 获取是否销毁。
		 * @return 是否销毁。
		 */
		public function get destroyed():Boolean{
				return null;
		}

		/**
		 * 创建一个 <code>GeometryElement</code> 实例。
		 */

		public function GeometryElement(){}

		/**
		 * 获取几何体类型。
		 */
		public function _getType():Number{
			return null;
		}

		/**
		 * 销毁。
		 */
		public function destroy():void{}
	}

}
