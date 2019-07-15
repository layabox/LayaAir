/*[IF-FLASH]*/
package laya.d3.physics.constraints {
	improt laya.components.Component;
	improt laya.d3.physics.Rigidbody3D;
	public class ConstraintComponent extends laya.components.Component {
		public var enabled:Boolean;
		public var breakingImpulseThreshold:Number;
		public function get appliedImpulse():Number{};
		public var connectedBody:Rigidbody3D;

		public function ConstraintComponent(){}
		protected function _onDestroy():void{}
	}

}
