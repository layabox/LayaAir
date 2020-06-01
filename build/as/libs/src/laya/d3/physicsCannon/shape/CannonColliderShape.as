package laya.d3.physicsCannon.shape {
	import laya.d3.core.IClone;
	import laya.d3.math.Quaternion;
	import laya.d3.math.Vector3;

	/**
	 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
	 */
	public class CannonColliderShape implements IClone {

		/**
		 * 形状方向_X轴正向
		 */
		public static var SHAPEORIENTATION_UPX:Number;

		/**
		 * 形状方向_Y轴正向
		 */
		public static var SHAPEORIENTATION_UPY:Number;

		/**
		 * 形状方向_Z轴正向
		 */
		public static var SHAPEORIENTATION_UPZ:Number;
		public var needsCustomCollisionCallback:Boolean;

		/**
		 * 碰撞类型。
		 */
		public function get type():Number{return null;}

		/**
		 * Shape的本地偏移。
		 */
		public function get localOffset():Vector3{return null;}
		public function set localOffset(value:Vector3):void{}

		/**
		 * Shape的本地旋转。
		 */
		public function get localRotation():Quaternion{return null;}
		public function set localRotation(value:Quaternion):void{}

		/**
		 * 创建一个新的 <code>ColliderShape</code> 实例。
		 */

		public function CannonColliderShape(){}

		/**
		 * 更新本地偏移,如果修改LocalOffset或LocalRotation需要调用。
		 */
		public function updateLocalTransformations():void{}

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

		/**
		 * 销毁。
		 */
		public function destroy():void{}
	}

}
