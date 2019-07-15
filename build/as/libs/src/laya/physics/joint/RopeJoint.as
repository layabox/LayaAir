/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class RopeJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var selfAnchor:Array;
		public var otherAnchor:Array;
		public var collideConnected:Boolean;
		private var _maxLength:*;
		protected function _createJoint():void{}
		public var maxLength:Number;
	}

}
