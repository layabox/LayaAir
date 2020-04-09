package laya.physics.joint {
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 鼠标关节：鼠标关节用于通过鼠标来操控物体。它试图将物体拖向当前鼠标光标的位置。而在旋转方面就没有限制。
	 */
	public class MouseJoint extends JointBase {

		/**
		 * @private 
		 */
		private static var _temp:*;

		/**
		 * [首次设置有效]关节的自身刚体
		 */
		public var selfBody:RigidBody;

		/**
		 * [首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移，如果不设置，则根据鼠标点击点作为连接点
		 */
		public var anchor:Array;

		/**
		 * 鼠标关节在拖曳刚体bodyB时施加的最大作用力
		 */
		private var _maxForce:*;

		/**
		 * 弹簧系统的震动频率，可以视为弹簧的弹性系数
		 */
		private var _frequency:*;

		/**
		 * 刚体在回归到节点过程中受到的阻尼，取值0~1
		 */
		private var _damping:*;
		private var onMouseDown:*;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}
		private var onStageMouseUp:*;
		private var onMouseMove:*;

		/**
		 * 鼠标关节在拖曳刚体bodyB时施加的最大作用力
		 */
		public var maxForce:Number;

		/**
		 * 弹簧系统的震动频率，可以视为弹簧的弹性系数
		 */
		public var frequency:Number;

		/**
		 * 刚体在回归到节点过程中受到的阻尼，取值0~1
		 */
		public var damping:Number;
	}

}
