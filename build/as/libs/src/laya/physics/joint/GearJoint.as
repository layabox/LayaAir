/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.physics.joint.JointBase;
	public class GearJoint extends laya.physics.joint.JointBase {
		private static var _temp:*;
		public var joint1:*;
		public var joint2:*;
		public var collideConnected:Boolean;
		private var _ratio:*;
		protected function _createJoint():void{}
		public var ratio:Number;
	}

}
