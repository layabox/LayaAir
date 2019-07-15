/*[IF-FLASH]*/
package laya.d3.physics {
	improt laya.d3.physics.PhysicsComponent;
	improt laya.d3.math.Vector3;
	public class HitResult {
		public var succeeded:Boolean;
		public var collider:PhysicsComponent;
		public var point:Vector3;
		public var normal:Vector3;
		public var hitFraction:Number;

		public function HitResult(){}
	}

}
