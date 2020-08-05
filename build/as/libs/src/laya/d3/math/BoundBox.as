package laya.d3.math {
	import laya.d3.math.Vector3;
	import laya.d3.core.IClone;

	/**
	 * <code>BoundBox</code> 类用于创建包围盒。
	 */
	public class BoundBox implements IClone {

		/**
		 * 最小顶点。
		 */
		public var min:Vector3;

		/**
		 * 最大顶点。
		 */
		public var max:Vector3;

		/**
		 * 创建一个 <code>BoundBox</code> 实例。
		 * @param min 包围盒的最小顶点。
		 * @param max 包围盒的最大顶点。
		 */

		public function BoundBox(min:Vector3 = undefined,max:Vector3 = undefined){}

		/**
		 * 获取包围盒的8个角顶点。
		 * @param corners 返回顶点的输出队列。
		 */
		public function getCorners(corners:Array):void{}

		/**
		 * 获取中心点。
		 * @param out 
		 */
		public function getCenter(out:Vector3):void{}

		/**
		 * 获取范围。
		 * @param out 
		 */
		public function getExtent(out:Vector3):void{}

		/**
		 * 设置中心点和范围。
		 * @param center 
		 */
		public function setCenterAndExtent(center:Vector3,extent:Vector3):void{}
		public function toDefault():void{}

		/**
		 * 从顶点生成包围盒。
		 * @param points 所需顶点队列。
		 * @param out 生成的包围盒。
		 */
		public static function createfromPoints(points:Array,out:BoundBox):void{}

		/**
		 * 合并两个包围盒。
		 * @param box1 包围盒1。
		 * @param box2 包围盒2。
		 * @param out 生成的包围盒。
		 */
		public static function merge(box1:BoundBox,box2:BoundBox,out:BoundBox):void{}

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
