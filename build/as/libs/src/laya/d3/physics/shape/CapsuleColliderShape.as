/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.math.Vector3;
	improt laya.d3.physics.shape.ColliderShape;
	public class CapsuleColliderShape extends laya.d3.physics.shape.ColliderShape {
		public function get radius():Number{};
		public function get length():Number{};
		public function get orientation():Number{};

		public function CapsuleColliderShape(radius:Number = null,length:Number = null,orientation:Number = null){}
		public function _setScale(value:Vector3):void{}
		public function clone():*{}
	}

}
