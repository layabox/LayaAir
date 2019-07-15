/*[IF-FLASH]*/
package laya.physics.joint {
	improt laya.components.Component;
	public class JointBase extends laya.components.Component {
		protected var _joint:*;
		public function get joint():*{};
		protected function _onEnable():void{}
		protected function _onAwake():void{}
		protected function _createJoint():void{}
		protected function _onDisable():void{}
	}

}
