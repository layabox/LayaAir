package laya.d3.physics.constraints {
	import laya.components.Component;
	import laya.d3.physics.Rigidbody3D;
	import laya.d3.math.Vector3;

	/**
	 * <code>ConstraintComponent</code> 类用于创建约束的父类。
	 */
	public class ConstraintComponent extends Component {

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get enabled():Boolean{return null;}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function set enabled(value:Boolean):void{}

		/**
		 * 获取应用的冲力。
		 */
		public function get appliedImpulse():Number{return null;}

		/**
		 * 获取连接的刚体B。
		 * @return 已连接刚体B。
		 */
		public function get connectedBody():Rigidbody3D{return null;}

		/**
		 * 获取连接的刚体A。
		 * @return 已连接刚体A。
		 */
		public function get ownBody():Rigidbody3D{return null;}

		/**
		 * 获得收到的总力
		 */
		public function get currentForce():Vector3{return null;}

		/**
		 * 获取的总力矩
		 */
		public function get currentTorque():Vector3{return null;}

		/**
		 * 设置最大承受力
		 * @param value 最大承受力
		 */
		public function get breakForce():Number{return null;}
		public function set breakForce(value:Number):void{}

		/**
		 * 设置最大承受力矩
		 * @param value 最大承受力矩
		 */
		public function get breakTorque():Number{return null;}
		public function set breakTorque(value:Number):void{}
		public function set anchor(value:Vector3):void{}
		public function get anchor():Vector3{return null;}
		public function set connectAnchor(value:Vector3):void{}
		public function get connectAnchor():Vector3{return null;}

		/**
		 * 创建一个 <code>ConstraintComponent</code> 实例。
		 */

		public function ConstraintComponent(constraintType:Number = undefined){}

		/**
		 * 设置迭代的次数，次数越高，越精确
		 * @param overideNumIterations 
		 */
		public function setOverrideNumSolverIterations(overideNumIterations:Number):void{}

		/**
		 * 设置约束是否可用
		 * @param enable 
		 */
		public function setConstraintEnabled(enable:Boolean):void{}
		public function _onDisable():void{}

		/**
		 * 设置约束刚体
		 * @param ownerRigid 
		 * @param connectRigidBody 
		 * @override 
		 */
		override public function setConnectRigidBody(ownerRigid:Rigidbody3D,connectRigidBody:Rigidbody3D):void{}

		/**
		 * 获得当前力
		 * @param out 
		 */
		public function getcurrentForce(out:Vector3):void{}

		/**
		 * 获得当前力矩
		 * @param out 
		 */
		public function getcurrentTorque(out:Vector3):void{}
	}

}
