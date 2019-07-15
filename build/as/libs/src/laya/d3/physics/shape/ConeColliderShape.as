/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.physics.shape.ColliderShape;
	public class ConeColliderShape extends laya.d3.physics.shape.ColliderShape {
		private var _orientation:*;
		private var _radius:*;
		private var _height:*;
		public function get radius():Number{};
		public function get height():Number{};
		public function get orientation():Number{};

		public function ConeColliderShape(radius:Number = null,height:Number = null,orientation:Number = null){}
		public function clone():*{}
	}

}
