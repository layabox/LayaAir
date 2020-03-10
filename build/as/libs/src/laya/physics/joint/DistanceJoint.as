package laya.physics.joint {
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 距离关节：两个物体上面各自有一点，两点之间的距离固定不变
	 */
	public class DistanceJoint extends JointBase {

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
		 * [首次设置有效]自身刚体链接点，是相对于自身刚体的左上角位置偏移
		 */
		public var selfAnchor:Array;

		/**
		 * [首次设置有效]链接刚体链接点，是相对于otherBody的左上角位置偏移
		 */
		public var otherAnchor:Array;

		/**
		 * [首次设置有效]两个刚体是否可以发生碰撞，默认为false
		 */
		public var collideConnected:Boolean;

		/**
		 * 约束的目标静止长度
		 */
		private var _length:*;

		/**
		 * 弹簧系统的震动频率，可以视为弹簧的弹性系数
		 */
		private var _frequency:*;

		/**
		 * 刚体在回归到节点过程中受到的阻尼，建议取值0~1
		 */
		private var _damping:*;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}

		/**
		 * 约束的目标静止长度
		 */
		public var length:Number;

		/**
		 * 弹簧系统的震动频率，可以视为弹簧的弹性系数
		 */
		public var frequency:Number;

		/**
		 * 刚体在回归到节点过程中受到的阻尼，建议取值0~1
		 */
		public var damping:Number;
	}

}
