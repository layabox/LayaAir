/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class WeldJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var anchor:Array;
		public var collideConnected:Boolean;
		private var _frequency:*;
		private var _damping:*;
		protected function _createJoint():void{}
		public var frequency:Number;
		public var damping:Number;
	}

}
