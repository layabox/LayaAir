/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.physics.shape.ColliderShape;
	public class SphereColliderShape extends laya.d3.physics.shape.ColliderShape {
		private var _radius:*;
		public function get radius():Number{};

		public function SphereColliderShape(radius:Number = null){}
		public function clone():*{}
	}

}
