/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	improt laya.physics.RigidBody;
	public class MouseJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var selfBody:RigidBody;
		public var anchor:Array;
		private var _maxForce:*;
		private var _frequency:*;
		private var _damping:*;
		protected function _onEnable():void{}
		protected function _onAwake():void{}
		private var onMouseDown:*;
		protected function _createJoint():void{}
		private var onStageMouseUp:*;
		private var onMouseMove:*;
		protected function _onDisable():void{}
		public var maxForce:Number;
		public var frequency:Number;
		public var damping:Number;
	}

}
