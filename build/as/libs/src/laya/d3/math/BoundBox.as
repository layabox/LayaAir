/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	improt laya.d3.core.IClone;
	public class BoundBox implements laya.d3.core.IClone {
		public var min:Vector3;
		public var max:Vector3;

		public function BoundBox(min:Vector3,max:Vector3){}
		public function getCorners(corners:Array):void{}
		public function getCenter(out:Vector3):void{}
		public function getExtent(out:Vector3):void{}
		public function setCenterAndExtent(center:Vector3,extent:Vector3):void{}
		public function toDefault():void{}
		public static function createfromPoints(points:Array,out:BoundBox):void{}
		public static function merge(box1:BoundBox,box2:BoundBox,out:BoundBox):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
