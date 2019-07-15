/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class WheelJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var anchor:Array;
		public var collideConnected:Boolean;
		public var axis:Array;
		private var _frequency:*;
		private var _damping:*;
		private var _enableMotor:*;
		private var _motorSpeed:*;
		private var _maxMotorTorque:*;
		protected function _createJoint():void{}
		public var frequency:Number;
		public var damping:Number;
		public var enableMotor:Boolean;
		public var motorSpeed:Number;
		public var maxMotorTorque:Number;
	}

}
