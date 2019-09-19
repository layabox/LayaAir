package laya.physics.joint {
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 马达关节：用来限制两个刚体，使其相对位置和角度保持不变
	 */
	public class MotorJoint extends JointBase {

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
		 * [首次设置有效]两个刚体是否可以发生碰撞，默认为false
		 */
		public var collideConnected:Boolean;

		/**
		 * 基于otherBody坐标位置的偏移量，也是selfBody的目标位置
		 */
		private var _linearOffset:*;

		/**
		 * 基于otherBody的角度偏移量，也是selfBody的目标角度
		 */
		private var _angularOffset:*;

		/**
		 * 当selfBody偏离目标位置时，为使其恢复到目标位置，马达关节所施加的最大作用力
		 */
		private var _maxForce:*;

		/**
		 * 当selfBody角度与目标角度不同时，为使其达到目标角度，马达关节施加的最大扭力
		 */
		private var _maxTorque:*;

		/**
		 * selfBody向目标位置移动时的缓动因子，取值0~1，值越大速度越快
		 */
		private var _correctionFactor:*;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}

		/**
		 * 基于otherBody坐标位置的偏移量，也是selfBody的目标位置
		 */
		public var linearOffset:Array;

		/**
		 * 基于otherBody的角度偏移量，也是selfBody的目标角度
		 */
		public var angularOffset:Number;

		/**
		 * 当selfBody偏离目标位置时，为使其恢复到目标位置，马达关节所施加的最大作用力
		 */
		public var maxForce:Number;

		/**
		 * 当selfBody角度与目标角度不同时，为使其达到目标角度，马达关节施加的最大扭力
		 */
		public var maxTorque:Number;

		/**
		 * selfBody向目标位置移动时的缓动因子，取值0~1，值越大速度越快
		 */
		public var correctionFactor:Number;
	}

}
