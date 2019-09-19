package laya.d3.physics.constraints {
	import laya.components.Component;
	import laya.d3.physics.Rigidbody3D;

	/**
	 * <code>ConstraintComponent</code> 类用于创建约束的父类。
	 */
	public class ConstraintComponent extends Component {

		/**
		 * 获取打破冲力阈值。
		 * @return 打破冲力阈值。
		 */

		/**
		 * 设置打破冲力阈值。
		 * @param value 打破冲力阈值。
		 */
		public var breakingImpulseThreshold:Number;

		/**
		 * 获取应用的冲力。
		 */
		public function get appliedImpulse():Number{
				return null;
		}

		/**
		 * 获取已连接的刚体。
		 * @return 已连接刚体。
		 */

		/**
		 * 设置已连接刚体。
		 * @param value 已连接刚体。
		 */
		public var connectedBody:Rigidbody3D;

		/**
		 * 创建一个 <code>ConstraintComponent</code> 实例。
		 */

		public function ConstraintComponent(){}
	}

}
