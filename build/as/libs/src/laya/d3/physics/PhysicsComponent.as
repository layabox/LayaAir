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
		 * 弹力。
		 */
		public var restitution:Number;

		/**
		 * 摩擦力。
		 */
		public var friction:Number;

		/**
		 * 滚动摩擦力。
		 */
		public var rollingFriction:Number;

		/**
		 * 用于连续碰撞检测(CCD)的速度阈值,当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
		 */
		public var ccdMotionThreshold:Number;

		/**
		 * 获取用于进入连续碰撞检测(CCD)范围的球半径。
		 */
		public var ccdSweptSphereRadius:Number;

		/**
		 * 获取是否激活。
		 */
		public function get isActive():Boolean{
				return null;
		}

		/**
		 * 碰撞形状。
		 */
		public var colliderShape:ColliderShape;

		/**
		 * 模拟器。
		 */
		public function get simulation():PhysicsSimulation{
				return null;
		}

		/**
		 * 所属碰撞组。
		 */
		public var collisionGroup:Number;

		/**
		 * 可碰撞的碰撞组,基于位运算。
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
