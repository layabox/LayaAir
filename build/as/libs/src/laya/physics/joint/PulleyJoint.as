package laya.physics.joint {
	import laya.physics.joint.JointBase;
	import laya.physics.RigidBody;

	/**
	 * 滑轮关节：它将两个物体接地(ground)并彼此连接，当一个物体上升，另一个物体就会下降
	 */
	public class PulleyJoint extends JointBase {

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
		 * [首次设置有效]自身刚体链接点，是相对于自身刚体的左上角位置偏移
		 */
		public var selfAnchor:Array;

		/**
		 * [首次设置有效]链接刚体链接点，是相对于otherBody的左上角位置偏移
		 */
		public var otherAnchor:Array;

		/**
		 * [首次设置有效]滑轮上与节点selfAnchor相连接的节点，是相对于自身刚体的左上角位置偏移
		 */
		public var selfGroundPoint:Array;

		/**
		 * [首次设置有效]滑轮上与节点otherAnchor相连接的节点，是相对于otherBody的左上角位置偏移
		 */
		public var otherGroundPoint:Array;

		/**
		 * [首次设置有效]两刚体移动距离比率
		 */
		public var ratio:Number;

		/**
		 * [首次设置有效]两个刚体是否可以发生碰撞，默认为false
		 */
		public var collideConnected:Boolean;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}
	}

}
