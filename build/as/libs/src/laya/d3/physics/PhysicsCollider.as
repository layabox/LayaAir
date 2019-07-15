/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.d3.physics.PhysicsTriggerComponent;
	public class PhysicsCollider extends laya.d3.physics.PhysicsTriggerComponent {

		public function PhysicsCollider(collisionGroup:Number = null,canCollideWith:Number = null){}
		public function _addToSimulation():void{}
		public function _removeFromSimulation():void{}
		public function _onTransformChanged(flag:Number):void{}
		public function _parse(data:*):void{}
		public function _onAdded():void{}
	}

}
