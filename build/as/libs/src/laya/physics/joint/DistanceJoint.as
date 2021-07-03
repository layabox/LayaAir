package laya.physics.joint {
	import laya.physics.RigidBody;
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
		 * 约束的最小长度，-1表示使用默认值
		 */
		private var _maxLength:*;

		/**
		 * 约束的最大长度，-1表示使用默认值
		 */
		private var _minLength:*;

		/**
		 * 弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半
		 */
		private var _frequency:*;

		/**
		 * 刚体在回归到节点过程中受到的阻尼比，建议取值0~1
		 */
		private var _dampingRatio:*;

		/**
		 * @override 
		 */
		override protected function _createJoint():void{}

		/**
		 * 约束的目标静止长度
		 */
		public function get length():Number{return null;}
		public function set length(value:Number):void{}

		/**
		 * 约束的最小长度
		 */
		public function get minLength():Number{return null;}
		public function set minLength(value:Number):void{}

		/**
		 * 约束的最大长度
		 */
		public function get maxLength():Number{return null;}
		public function set maxLength(value:Number):void{}

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
	}

}
