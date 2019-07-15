/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.IClone;
	improt laya.d3.math.BoundBox;
	improt laya.d3.math.Vector3;
	public class Bounds implements laya.d3.core.IClone {
		private var _updateFlag:*;
		public var _boundBox:BoundBox;
		public function setMin(value:Vector3):void{}
		public function getMin():Vector3{}
		public function setMax(value:Vector3):void{}
		public function getMax():Vector3{}
		public function setCenter(value:Vector3):void{}
		public function getCenter():Vector3{}
		public function setExtent(value:Vector3):void{}
		public function getExtent():Vector3{}

		public function Bounds(min:Vector3,max:Vector3){}
		private var _getUpdateFlag:*;
		private var _setUpdateFlag:*;
		private var _getCenter:*;
		private var _getExtent:*;
		private var _getMin:*;
		private var _getMax:*;
		private var _rotateExtents:*;
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
