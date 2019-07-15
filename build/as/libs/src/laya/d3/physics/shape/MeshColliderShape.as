/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.math.Vector3;
	improt laya.d3.resource.models.Mesh;
	improt laya.d3.physics.shape.ColliderShape;
	public class MeshColliderShape extends laya.d3.physics.shape.ColliderShape {
		private var _mesh:*;
		private var _convex:*;
		public var mesh:Mesh;
		public var convex:Boolean;

		public function MeshColliderShape(){}
		public function _setScale(value:Vector3):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function destroy():void{}
	}

}
