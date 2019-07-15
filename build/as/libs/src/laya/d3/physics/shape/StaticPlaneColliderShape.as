/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.physics.shape.ColliderShape;
	improt laya.d3.math.Vector3;
	public class StaticPlaneColliderShape extends laya.d3.physics.shape.ColliderShape {
		private static var _nativeNormal:*;

		public function StaticPlaneColliderShape(normal:Vector3,offset:Number){}
		public function clone():*{}
	}

}
