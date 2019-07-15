/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.physics.shape.ColliderShape;
	public class BoxColliderShape extends laya.d3.physics.shape.ColliderShape {
		public function get sizeX():Number{};
		public function get sizeY():Number{};
		public function get sizeZ():Number{};

		public function BoxColliderShape(sizeX:Number = null,sizeY:Number = null,sizeZ:Number = null){}
		public function clone():*{}
	}

}
