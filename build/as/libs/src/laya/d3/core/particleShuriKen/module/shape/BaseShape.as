/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module.shape {
	improt laya.d3.core.IClone;
	improt laya.d3.math.Rand;
	improt laya.d3.math.Vector3;
	public class BaseShape implements laya.d3.core.IClone {
		public var enable:Boolean;
		public var randomDirection:Boolean;

		public function BaseShape(){}
		public function generatePositionAndDirection(position:Vector3,direction:Vector3,rand:Rand = null,randomSeeds:Uint32Array = null):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
