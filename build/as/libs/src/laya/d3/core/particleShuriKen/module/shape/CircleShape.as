/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module.shape {
	improt laya.d3.core.particleShuriKen.module.shape.BaseShape;
	improt laya.d3.math.BoundBox;
	improt laya.d3.math.Rand;
	improt laya.d3.math.Vector3;
	public class CircleShape extends laya.d3.core.particleShuriKen.module.shape.BaseShape {
		public var radius:Number;
		public var arc:Number;
		public var emitFromEdge:Boolean;

		public function CircleShape(){}
		protected function _getShapeBoundBox(boundBox:BoundBox):void{}
		protected function _getSpeedBoundBox(boundBox:BoundBox):void{}
		public function generatePositionAndDirection(position:Vector3,direction:Vector3,rand:Rand = null,randomSeeds:Uint32Array = null):void{}
		public function cloneTo(destObject:*):void{}
	}

}
