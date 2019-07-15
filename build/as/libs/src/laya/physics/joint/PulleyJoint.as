/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class PulleyJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var selfAnchor:Array;
		public var otherAnchor:Array;
		public var selfGroundPoint:Array;
		public var otherGroundPoint:Array;
		public var ratio:Number;
		public var collideConnected:Boolean;
		protected function _createJoint():void{}
	}

}
