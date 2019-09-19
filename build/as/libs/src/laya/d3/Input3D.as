package laya.d3 {
	import laya.d3.Touch;

	/**
	 * <code>Input3D</code> 类用于实现3D输入。
	 */
	public class Input3D {

		/**
		 * 获取触摸点个数。
		 * @return 触摸点个数。
		 */
		public function touchCount():Number{
			return null;
		}

		/**
		 * 获取是否可以使用多点触摸。
		 * @return 是否可以使用多点触摸。
		 */

		/**
		 * 设置是否可以使用多点触摸。
		 * @param 是否可以使用多点触摸 。
		 */
		public var multiTouchEnabled:Boolean;

		/**
		 * 获取触摸点。
		 * @param index 索引。
		 * @return 触摸点。
		 */
		public function getTouch(index:Number):Touch{
			return null;
		}
	}

}
