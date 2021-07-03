package laya.physics.joint {
	import laya.physics.RigidBody;
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 轮子关节：围绕节点旋转，包含弹性属性，使得刚体在节点位置发生弹性偏移
	 */
	public class WheelJoint extends JointBase {

		/**
		 * @private 
		 */
		private static var _temp:*;

		/**
		 * [首次设置有效]关节的自身刚体
		 */
		public var selfBody:RigidBody;

		/**
		 * [首次设置有效]关节的连接刚体
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
		 * [首次设置有效]一个向量值，描述运动方向，比如1,0是沿X轴向右
		 */
		public var axis:Array;

		/**
		 * 弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半
		 */
		private var _frequency:*;

		/**
		 * 刚体在回归到节点过程中受到的阻尼比，建议取值0~1
		 */
		private var _dampingRatio:*;

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
		 * 弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半
		 */
		public function get frequency():Number{return null;}
		public function set frequency(value:Number):void{}

		/**
		 * 刚体在回归到节点过程中受到的阻尼比，建议取值0~1
		 */
		public function get damping():Number{return null;}
		public function set damping(value:Number):void{}

		/**
		 * 是否开启马达，开启马达可使目标刚体运动
		 */
		public function get enableMotor():Boolean{return null;}
		public function set enableMotor(value:Boolean):void{}

		/**
		 * 启用马达后，可以达到的最大旋转速度
		 */
		public function get motorSpeed():Number{return null;}
		public function set motorSpeed(value:Number):void{}

		/**
		 * 启用马达后，可以施加的最大扭距，如果最大扭矩太小，会导致不旋转
		 */
		public function get maxMotorTorque():Number{return null;}
		public function set maxMotorTorque(value:Number):void{}

		/**
		 * 是否对刚体的移动范围加以约束
		 */
		public function get enableLimit():Boolean{return null;}
		public function set enableLimit(value:Boolean):void{}

		/**
		 * 启用约束后，刚体移动范围的下限，是距离anchor的偏移量
		 */
		public function get lowerTranslation():Number{return null;}
		public function set lowerTranslation(value:Number):void{}

		/**
		 * 启用约束后，刚体移动范围的上限，是距离anchor的偏移量
		 */
		public function get upperTranslation():Number{return null;}
		public function set upperTranslation(value:Number):void{}
	}

}
