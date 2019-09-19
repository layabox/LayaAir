package laya.physics.joint {
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 旋转关节强制两个物体共享一个锚点，两个物体相对旋转
	 */
	public class RevoluteJoint extends JointBase {

		/**
		 * @private 
		 */
		private static var _temp:*;

		/**
		 * [首次设置有效]关节的自身刚体
		 */
		public var selfBody:RigidBody;

		/**
		 * [首次设置有效]关节的连接刚体，可不设置
		 */
		public var otherBody:RigidBody;

		/**
		 * [首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移
		 */
		public var anchor:Array;

		/**
		 * [首次设置有效]两个刚体是否可以发生碰撞，默认为false
		 */
		public var collideConnected:Boolean;

		/**
		 * 是否开启马达，开启马达可使目标刚体运动
		 */
		private var _enableMotor:*;

		/**
		 * 启用马达后，可以达到的最大旋转速度
		 */
		private var _motorSpeed:*;

		/**
		 * 启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转
		 */
		private var _maxMotorTorque:*;

		/**
		 * 是否对刚体的旋转范围加以约束
		 */
		private var _enableLimit:*;

		/**
		 * 启用约束后，刚体旋转范围的下限弧度
		 */
		private var _lowerAngle:*;

		/**
		 * 启用约束后，刚体旋转范围的上限弧度
		 */
		private var _upperAngle:*;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}

		/**
		 * 是否开启马达，开启马达可使目标刚体运动
		 */
		public var enableMotor:Boolean;

		/**
		 * 启用马达后，可以达到的最大旋转速度
		 */
		public var motorSpeed:Number;

		/**
		 * 启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转
		 */
		public var maxMotorTorque:Number;

		/**
		 * 是否对刚体的旋转范围加以约束
		 */
		public var enableLimit:Boolean;

		/**
		 * 启用约束后，刚体旋转范围的下限弧度
		 */
		public var lowerAngle:Number;

		/**
		 * 启用约束后，刚体旋转范围的上限弧度
		 */
		public var upperAngle:Number;
	}

}
