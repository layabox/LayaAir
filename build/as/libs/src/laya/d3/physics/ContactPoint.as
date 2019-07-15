/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.d3.physics.PhysicsComponent;
	improt laya.d3.math.Vector3;
	public class ContactPoint {
		public var colliderA:PhysicsComponent;
		public var colliderB:PhysicsComponent;
		public var distance:Number;
		public var normal:Vector3;
		public var positionOnA:Vector3;
		public var positionOnB:Vector3;

		public function ContactPoint(){}
	}

}
