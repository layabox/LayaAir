package laya.d3.physicsCannon {
	import laya.components.Component;
	import laya.d3.physicsCannon.CannonPhysicsSimulation;
	import laya.d3.physicsCannon.shape.CannonColliderShape;

	/**
	 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
	 */
	public class CannonPhysicsComponent extends Component {

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
		 * 碰撞形状。
		 */
		public function get colliderShape():CannonColliderShape{return null;}
		public function set colliderShape(value:CannonColliderShape):void{}

		/**
		 * 模拟器。
		 */
		public function get simulation():CannonPhysicsSimulation{return null;}

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

		public function CannonPhysicsComponent(collisionGroup:Number = undefined,canCollideWith:Number = undefined){}
	}

}
