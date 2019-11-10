package laya.d3.utils {
	import laya.d3.math.Vector3;
	import laya.d3.physics.PhysicsComponent;

	/**
	 * <code>Physics</code> 类用于简单物理检测。
	 */
	public class Physics3DUtils {
		public static var COLLISIONFILTERGROUP_DEFAULTFILTER:Number;
		public static var COLLISIONFILTERGROUP_STATICFILTER:Number;
		public static var COLLISIONFILTERGROUP_KINEMATICFILTER:Number;
		public static var COLLISIONFILTERGROUP_DEBRISFILTER:Number;
		public static var COLLISIONFILTERGROUP_SENSORTRIGGER:Number;
		public static var COLLISIONFILTERGROUP_CHARACTERFILTER:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER1:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER2:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER3:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER4:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER5:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER6:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER7:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER8:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER9:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER10:Number;
		public static var COLLISIONFILTERGROUP_ALLFILTER:Number;

		/**
		 * 重力值。
		 */
		public static var gravity:Vector3;

		/**
		 * 创建一个 <code>Physics</code> 实例。
		 */

		public function Physics3DUtils(){}

		/**
		 * 是否忽略两个碰撞器的碰撞检测。
		 * @param collider1 碰撞器一。
		 * @param collider2 碰撞器二。
		 * @param ignore 是否忽略。
		 */
		public static function setColliderCollision(collider1:PhysicsComponent,collider2:PhysicsComponent,collsion:Boolean):void{}

		/**
		 * 获取是否忽略两个碰撞器的碰撞检测。
		 * @param collider1 碰撞器一。
		 * @param collider2 碰撞器二。
		 * @return 是否忽略。
		 */
		public static function getIColliderCollision(collider1:PhysicsComponent,collider2:PhysicsComponent):Boolean{
			return null;
		}
	}

}
