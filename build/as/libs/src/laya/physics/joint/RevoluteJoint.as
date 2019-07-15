/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class RevoluteJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var anchor:Array;
		public var collideConnected:Boolean;
		private var _enableMotor:*;
		private var _motorSpeed:*;
		private var _maxMotorTorque:*;
		private var _enableLimit:*;
		private var _lowerAngle:*;
		private var _upperAngle:*;
		protected function _createJoint():void{}
		public var enableMotor:Boolean;
		public var motorSpeed:Number;
		public var maxMotorTorque:Number;
		public var enableLimit:Boolean;
		public var lowerAngle:Number;
		public var upperAngle:Number;
	}

}
