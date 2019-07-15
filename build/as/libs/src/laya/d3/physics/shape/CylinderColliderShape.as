/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.physics.shape.ColliderShape;
	public class CylinderColliderShape extends laya.d3.physics.shape.ColliderShape {
		private static var _nativeSize:*;
		private var _orientation:*;
		private var _radius:*;
		private var _height:*;
		public function get radius():Number{};
		public function get height():Number{};
		public function get orientation():Number{};

		public function CylinderColliderShape(radius:Number = null,height:Number = null,orientation:Number = null){}
		public function clone():*{}
	}

}
