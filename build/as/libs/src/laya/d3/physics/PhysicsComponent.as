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
		public function get restitution():Number{return null;}
		public function set restitution(value:Number):void{}

		/**
		 * 摩擦力。
		 */
		public function get friction():Number{return null;}
		public function set friction(value:Number):void{}

		/**
		 * 滚动摩擦力。
		 */
		public function get rollingFriction():Number{return null;}
		public function set rollingFriction(value:Number):void{}

		/**
		 * 用于连续碰撞检测(CCD)的速度阈值,当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
		 */
		public function get ccdMotionThreshold():Number{return null;}
		public function set ccdMotionThreshold(value:Number):void{}

		/**
		 * 获取用于进入连续碰撞检测(CCD)范围的球半径。
		 */
		public function get ccdSweptSphereRadius():Number{return null;}
		public function set ccdSweptSphereRadius(value:Number):void{}

		/**
		 * 获取是否激活。
		 */
		public function get isActive():Boolean{return null;}

		/**
		 * 碰撞形状。
		 */
		public function get colliderShape():ColliderShape{return null;}
		public function set colliderShape(value:ColliderShape):void{}

		/**
		 * 模拟器。
		 */
		public function get simulation():PhysicsSimulation{return null;}

		/**
		 * 所属碰撞组。
		 */
		public function get collisionGroup():Number{return null;}
		public function set collisionGroup(value:Number):void{}

		/**
		 * 可碰撞的碰撞组,基于位运算。
		 */
		public function get canCollideWith():Number{return null;}
		public function set canCollideWith(value:Number):void{}

		/**
		 * 创建一个 <code>PhysicsComponent</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		public function PhysicsComponent(collisionGroup:Number = undefined,canCollideWith:Number = undefined){}
	}

}
