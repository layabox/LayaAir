package laya.physics.joint {
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 绳索关节：限制了两个点之间的最大距离。它能够阻止连接的物体之间的拉伸，即使在很大的负载下
	 */
	public class RopeJoint extends JointBase {

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
		 * selfAnchor和otherAnchor之间的最大距离
		 */
		private var _maxLength:*;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}

		/**
		 * selfAnchor和otherAnchor之间的最大距离
		 */
		public var maxLength:Number;
	}

}
