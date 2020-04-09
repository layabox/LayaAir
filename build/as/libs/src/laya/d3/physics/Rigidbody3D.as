package laya.d3.physics {
	import laya.d3.math.Vector3;
	import laya.d3.physics.PhysicsTriggerComponent;

	/**
	 * <code>Rigidbody3D</code> 类用于创建刚体碰撞器。
	 */
	public class Rigidbody3D extends PhysicsTriggerComponent {
		public static var TYPE_STATIC:Number;
		public static var TYPE_DYNAMIC:Number;
		public static var TYPE_KINEMATIC:Number;

		/**
		 * 质量。
		 */
		public var mass:Number;

		/**
		 * 是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
		 */
		public var isKinematic:Boolean;

		/**
		 * 刚体的线阻力。
		 */
		public var linearDamping:Number;

		/**
		 * 刚体的角阻力。
		 */
		public var angularDamping:Number;

		/**
		 * 是否重载重力。
		 */
		public var overrideGravity:Boolean;

		/**
		 * 重力。
		 */
		public var gravity:Vector3;

		/**
		 * 总力。
		 */
		public function get totalForce():Vector3{
				return null;
		}

		/**
		 * 每个轴的线性运动缩放因子,如果某一轴的值为0表示冻结在该轴的线性运动。
		 */
		public var linearFactor:Vector3;

		/**
		 * 线速度
		 */
		public var linearVelocity:Vector3;

		/**
		 * 每个轴的角度运动缩放因子,如果某一轴的值为0表示冻结在该轴的角度运动。
		 */
		public var angularFactor:Vector3;

		/**
		 * 角速度。
		 */
		public var angularVelocity:Vector3;

		/**
		 * 刚体所有扭力。
		 */
		public function get totalTorque():Vector3{
				return null;
		}

		/**
		 * 是否进行碰撞检测。
		 */
		public var detectCollisions:Boolean;

		/**
		 * 是否处于睡眠状态。
		 */
		public function get isSleeping():Boolean{
				return null;
		}

		/**
		 * 刚体睡眠的线速度阈值。
		 */
		public var sleepLinearVelocity:Number;

		/**
		 * 刚体睡眠的角速度阈值。
		 */
		public var sleepAngularVelocity:Number;

		/**
		 * 创建一个 <code>RigidBody3D</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		public function Rigidbody3D(collisionGroup:Number = undefined,canCollideWith:Number = undefined){}

		/**
		 * 应用作用力。
		 * @param force 作用力。
		 * @param localOffset 偏移,如果为null则为中心点
		 */
		public function applyForce(force:Vector3,localOffset:Vector3 = null):void{}

		/**
		 * 应用扭转力。
		 * @param torque 扭转力。
		 */
		public function applyTorque(torque:Vector3):void{}

		/**
		 * 应用冲量。
		 * @param impulse 冲量。
		 * @param localOffset 偏移,如果为null则为中心点。
		 */
		public function applyImpulse(impulse:Vector3,localOffset:Vector3 = null):void{}

		/**
		 * 应用扭转冲量。
		 * @param torqueImpulse 
		 */
		public function applyTorqueImpulse(torqueImpulse:Vector3):void{}

		/**
		 * 唤醒刚体。
		 */
		public function wakeUp():void{}

		/**
		 * 清除应用到刚体上的所有力。
		 */
		public function clearForces():void{}
	}

}
