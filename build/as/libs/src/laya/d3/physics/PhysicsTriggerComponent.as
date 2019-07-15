/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.components.Component;
	improt laya.d3.physics.PhysicsComponent;
	public class PhysicsTriggerComponent extends laya.d3.physics.PhysicsComponent {
		public var isTrigger:Boolean;

		public function PhysicsTriggerComponent(collisionGroup:Number,canCollideWith:Number){}
		public function _onAdded():void{}
		public function _cloneTo(dest:Component):void{}
	}

}
