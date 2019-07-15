/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class MotorJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var collideConnected:Boolean;
		private var _linearOffset:*;
		private var _angularOffset:*;
		private var _maxForce:*;
		private var _maxTorque:*;
		private var _correctionFactor:*;
		protected function _createJoint():void{}
		public var linearOffset:Array;
		public var angularOffset:Number;
		public var maxForce:Number;
		public var maxTorque:Number;
		public var correctionFactor:Number;
	}

}
