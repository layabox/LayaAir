package laya.d3.utils {
	import laya.d3.physics.PhysicsComponent;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector3;
	import laya.d3.physics.PhysicsComponent;

	/**
	 * <code>Physics</code> 类用于简单物理检测。
	 */
	public class Physics3DUtils {

		/**
		 * 默认碰撞组
		 */
		public static var COLLISIONFILTERGROUP_DEFAULTFILTER:Number;

		/**
		 * 静态碰撞组
		 */
		public static var COLLISIONFILTERGROUP_STATICFILTER:Number;

		/**
		 * 运动学刚体碰撞组
		 */
		public static var COLLISIONFILTERGROUP_KINEMATICFILTER:Number;

		/**
		 * 碎片碰撞组
		 */
		public static var COLLISIONFILTERGROUP_DEBRISFILTER:Number;

		/**
		 * 传感器触发器
		 */
		public static var COLLISIONFILTERGROUP_SENSORTRIGGER:Number;

		/**
		 * 字符过滤器
		 */
		public static var COLLISIONFILTERGROUP_CHARACTERFILTER:Number;

		/**
		 * 自定义过滤1
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER1:Number;

		/**
		 * 自定义过滤2
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER2:Number;

		/**
		 * 自定义过滤3
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER3:Number;

		/**
		 * 自定义过滤4
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER4:Number;

		/**
		 * 自定义过滤5
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER5:Number;

		/**
		 * 自定义过滤6
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER6:Number;

		/**
		 * 自定义过滤7
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER7:Number;

		/**
		 * 自定义过滤8
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER8:Number;

		/**
		 * 自定义过滤9
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER9:Number;

		/**
		 * 自定义过滤10
		 */
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER10:Number;

		/**
		 * 所有过滤
		 */
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
