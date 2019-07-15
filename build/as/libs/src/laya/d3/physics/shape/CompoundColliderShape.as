/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.physics.shape.ColliderShape;
	public class CompoundColliderShape extends laya.d3.physics.shape.ColliderShape {

		public function CompoundColliderShape(){}
		public function _addReference():void{}
		public function _removeReference():void{}
		public function addChildShape(shape:ColliderShape):void{}
		public function removeChildShape(shape:ColliderShape):void{}
		public function clearChildShape():void{}
		public function getChildShapeCount():Number{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function destroy():void{}
	}

}
