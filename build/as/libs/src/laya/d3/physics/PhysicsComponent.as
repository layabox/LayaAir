package laya.d3.physics {
	import laya.components.Component;
	import laya.d3.physics.PhysicsSimulation;
	import laya.d3.physics.shape.ColliderShape;

	/**
	 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
	 */
	public class PhysicsComponent extends Component {

		/**
		 * 是否可以缩放Shape。
		 */
		public var canScaleShape:Boolean;

		/**
		 * 获取弹力。
		 * @return 弹力。
		 */

		/**
		 * 设置弹力。
		 * @param 弹力 。
		 */
		public var restitution:Number;

		/**
		 * 获取摩擦力。
		 * @return 摩擦力。
		 */

		/**
		 * 设置摩擦力。
		 * @param value 摩擦力。
		 */
		public var friction:Number;

		/**
		 * 获取滚动摩擦力。
		 * @return 滚动摩擦力。
		 */

		/**
		 * 设置滚动摩擦力。
		 * @param 滚动摩擦力 。
		 */
		public var rollingFriction:Number;

		/**
		 * 获取用于连续碰撞检测(CCD)的速度阈值,当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
		 * @return 连续碰撞检测(CCD)的速度阈值。
		 */

		/**
		 * 设置用于连续碰撞检测(CCD)的速度阈值，当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
		 * @param value 连续碰撞检测(CCD)的速度阈值。
		 */
		public var ccdMotionThreshold:Number;

		/**
		 * 获取用于进入连续碰撞检测(CCD)范围的球半径。
		 * @return 球半径。
		 */

		/**
		 * 设置用于进入连续碰撞检测(CCD)范围的球半径。
		 * @param 球半径 。
		 */
		public var ccdSweptSphereRadius:Number;

		/**
		 * 获取是否激活。
		 */
		public function get isActive():Boolean{
				return null;
		}

		/**
		 * 获取碰撞形状。
		 */

		/**
		 * 设置碰撞形状。
		 */
		public var colliderShape:ColliderShape;

		/**
		 * 获取模拟器。
		 * @return 模拟器。
		 */
		public function get simulation():PhysicsSimulation{
				return null;
		}

		/**
		 * 获取所属碰撞组。
		 * @return 所属碰撞组。
		 */

		/**
		 * 设置所属碰撞组。
		 * @param 所属碰撞组 。
		 */
		public var collisionGroup:Number;

		/**
		 * 获取可碰撞的碰撞组。
		 * @return 可碰撞组。
		 */

		/**
		 * 设置可碰撞的碰撞组。
		 * @param 可碰撞组 。
		 */
		public var canCollideWith:Number;

		/**
		 * 创建一个 <code>PhysicsComponent</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		public function PhysicsComponent(collisionGroup:Number = undefined,canCollideWith:Number = undefined){}
	}

}
