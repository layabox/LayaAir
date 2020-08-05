package laya.d3.core {
	import laya.d3.core.IClone;

	/**
	 * <code>KeyFrame</code> 类用于创建关键帧实例。
	 */
	public class Keyframe implements IClone {

		/**
		 * 时间。
		 */
		public var time:Number;

		/**
		 * 创建一个 <code>KeyFrame</code> 实例。
		 */

		public function Keyframe(){}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
