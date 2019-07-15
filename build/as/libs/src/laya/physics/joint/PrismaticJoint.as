/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class PrismaticJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var otherBody:RigidBody;
		public var anchor:Array;
		public var axis:Array;
		public var collideConnected:Boolean;
		private var _enableMotor:*;
		private var _motorSpeed:*;
		private var _maxMotorForce:*;
		private var _enableLimit:*;
		private var _lowerTranslation:*;
		private var _upperTranslation:*;
		protected function _createJoint():void{}
		public var enableMotor:Boolean;
		public var motorSpeed:Number;
		public var maxMotorForce:Number;
		public var enableLimit:Boolean;
		public var lowerTranslation:Number;
		public var upperTranslation:Number;
	}

}
