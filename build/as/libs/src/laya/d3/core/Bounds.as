package laya.d3.core {
	import laya.d3.core.IClone;
	import laya.d3.math.BoundBox;
	import laya.d3.math.Vector3;

	/**
	 * <code>Bounds</code> 类用于创建包围体。
	 */
	public class Bounds implements IClone {
		private var _updateFlag:*;

		/**
		 */
		public var _boundBox:BoundBox;

		/**
		 * 设置包围盒的最小点。
		 * @param value 包围盒的最小点。
		 */
		public function setMin(value:Vector3):void{}

		/**
		 * 获取包围盒的最小点。
		 * @return 包围盒的最小点。
		 */
		public function getMin():Vector3{
			return null;
		}

		/**
		 * 设置包围盒的最大点。
		 * @param value 包围盒的最大点。
		 */
		public function setMax(value:Vector3):void{}

		/**
		 * 获取包围盒的最大点。
		 * @return 包围盒的最大点。
		 */
		public function getMax():Vector3{
			return null;
		}

		/**
		 * 设置包围盒的中心点。
		 * @param value 包围盒的中心点。
		 */
		public function setCenter(value:Vector3):void{}

		/**
		 * 获取包围盒的中心点。
		 * @return 包围盒的中心点。
		 */
		public function getCenter():Vector3{
			return null;
		}

		/**
		 * 设置包围盒的范围。
		 * @param value 包围盒的范围。
		 */
		public function setExtent(value:Vector3):void{}

		/**
		 * 获取包围盒的范围。
		 * @return 包围盒的范围。
		 */
		public function getExtent():Vector3{
			return null;
		}

		/**
		 * 创建一个 <code>Bounds</code> 实例。
		 * @param min min 最小坐标
		 * @param max max 最大坐标。
		 */

		public function Bounds(min:Vector3 = undefined,max:Vector3 = undefined){}
		private var _getUpdateFlag:*;
		private var _setUpdateFlag:*;
		private var _getCenter:*;
		private var _getExtent:*;
		private var _getMin:*;
		private var _getMax:*;
		private var _rotateExtents:*;

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
