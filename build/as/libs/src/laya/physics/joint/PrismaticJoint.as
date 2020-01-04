package laya.physics.joint {
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 平移关节：移动关节允许两个物体沿指定轴相对移动，它会阻止相对旋转
	 */
	public class PrismaticJoint extends JointBase {

		/**
		 * @private 
		 */
		private static var _temp:*;

		/**
		 * [首次设置有效]关节的自身刚体
		 */
		public var selfBody:RigidBody;

		/**
		 * [首次设置有效]关节的连接刚体，可不设置，默认为左上角空刚体
		 */
		public var otherBody:RigidBody;

		/**
		 * [首次设置有效]关节的控制点，是相对于自身刚体的左上角位置偏移
		 */
		public var anchor:Array;

		/**
		 * [首次设置有效]一个向量值，描述运动方向，比如1,0是沿X轴向右
		 */
		public var axis:Array;

		/**
		 * [首次设置有效]两个刚体是否可以发生碰撞，默认为false
		 */
		public var collideConnected:Boolean;

		/**
		 * 是否开启马达，开启马达可使目标刚体运动
		 */
		private var _enableMotor:*;

		/**
		 * 启用马达后，在axis坐标轴上移动可以达到的最大速度
		 */
		private var _motorSpeed:*;

		/**
		 * 启用马达后，可以施加的最大作用力
		 */
		private var _maxMotorForce:*;

		/**
		 * 是否对刚体的移动范围加以约束
		 */
		private var _enableLimit:*;

		/**
		 * 启用约束后，刚体移动范围的下限，是距离anchor的偏移量
		 */
		private var _lowerTranslation:*;

		/**
		 * 启用约束后，刚体移动范围的上限，是距离anchor的偏移量
		 */
		private var _upperTranslation:*;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}

		/**
		 * 是否开启马达，开启马达可使目标刚体运动
		 */
		public var enableMotor:Boolean;

		/**
		 * 启用马达后，在axis坐标轴上移动可以达到的最大速度
		 */
		public var motorSpeed:Number;

		/**
		 * 启用马达后，可以施加的最大作用力
		 */
		public var maxMotorForce:Number;

		/**
		 * 是否对刚体的移动范围加以约束
		 */
		public var enableLimit:Boolean;

		/**
		 * 启用约束后，刚体移动范围的下限，是距离anchor的偏移量
		 */
		public var lowerTranslation:Number;

		/**
		 * 启用约束后，刚体移动范围的上限，是距离anchor的偏移量
		 */
		public var upperTranslation:Number;
	}

}
