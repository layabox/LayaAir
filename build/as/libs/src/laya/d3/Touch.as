package laya.d3 {
	import laya.d3.math.Vector2;
	import laya.resource.ISingletonElement;

	/**
	 * <code>Touch</code> 类用于实现触摸描述。
	 */
	public class Touch implements ISingletonElement {

		/**
		 * [实现IListPool接口]
		 */
		private var _indexInList:*;

		/**
		 * 获取唯一识别ID。
		 * @return 唯一识别ID。
		 */
		public function get identifier():Number{
				return null;
		}

		/**
		 * 获取触摸点的像素坐标。
		 * @return 触摸点的像素坐标 [只读]。
		 */
		public function get position():Vector2{
				return null;
		}

		/**
		 * [实现ISingletonElement接口]
		 */
		public function _getIndexInList():Number{
			return null;
		}

		/**
		 * [实现ISingletonElement接口]
		 */
		public function _setIndexInList(index:Number):void{}
	}

}
