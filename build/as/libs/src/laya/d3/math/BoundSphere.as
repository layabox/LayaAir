/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Ray;
	improt laya.d3.core.IClone;
	public class BoundSphere implements laya.d3.core.IClone {
		private static var _tempVector3:*;
		public var center:Vector3;
		public var radius:Number;

		public function BoundSphere(center:Vector3,radius:Number){}
		public function toDefault():void{}
		public static function createFromSubPoints(points:Array,start:Number,count:Number,out:BoundSphere):void{}
		public static function createfromPoints(points:Array,out:BoundSphere):void{}
		public function intersectsRayDistance(ray:Ray):Number{}
		public function intersectsRayPoint(ray:Ray,outPoint:Vector3):Number{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
