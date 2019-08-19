package laya.d3.physics.shape {
	import laya.d3.core.IClone;
	import laya.d3.math.Quaternion;
	import laya.d3.math.Vector3;

	/*
	 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
	 */
	public class ColliderShape implements IClone {
		public var needsCustomCollisionCallback:Boolean;

		/*
		 * 获取碰撞类型。
		 * @return 碰撞类型。
		 */
		public function get type():Number{
				return null;
		}

		/*
		 * 获取Shape的本地偏移。
		 * @return Shape的本地偏移。
		 */

		/*
		 * 设置Shape的本地偏移。
		 * @param Shape的本地偏移 。
		 */
		public var localOffset:Vector3;

		/*
		 * 获取Shape的本地旋转。
		 * @return Shape的本地旋转。
		 */

		/*
		 * 设置Shape的本地旋转。
		 * @param Shape的本地旋转 。
		 */
		public var localRotation:Quaternion;

		/*
		 * 创建一个新的 <code>ColliderShape</code> 实例。
		 */

		public function ColliderShape(){}

		/*
		 * 更新本地偏移,如果修改LocalOffset或LocalRotation需要调用。
		 */
		public function updateLocalTransformations():void{}

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}

		/*
		 * 销毁。
		 */
		public function destroy():void{}
	}

}
