/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class DistanceJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var selfAnchor:Array;
		public var otherAnchor:Array;
		public var collideConnected:Boolean;
		private var _length:*;
		private var _frequency:*;
		private var _damping:*;
		protected function _createJoint():void{}
		public var length:Number;
		public var frequency:Number;
		public var damping:Number;
	}

}
