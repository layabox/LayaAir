/*[IF-FLASH]*/
package laya.d3.physics.shape {
	improt laya.d3.core.IClone;
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Vector3;
	public class ColliderShape implements laya.d3.core.IClone {
		public var needsCustomCollisionCallback:Boolean;
		public function get type():Number{};
		public var localOffset:Vector3;
		public var localRotation:Quaternion;

		public function ColliderShape(){}
		public function updateLocalTransformations():void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
