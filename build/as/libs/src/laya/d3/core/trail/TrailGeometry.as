package laya.d3.core.trail {
	import laya.d3.core.GeometryElement;
	import laya.d3.core.trail.TrailFilter;

	/**
	 * <code>TrailGeometry</code> 类用于创建拖尾渲染单元。
	 */
	public class TrailGeometry extends GeometryElement {

		/**
		 * 轨迹准线_面向摄像机。
		 */
		public static var ALIGNMENT_VIEW:Number;

		/**
		 * 轨迹准线_面向运动方向。
		 */
		public static var ALIGNMENT_TRANSFORM_Z:Number;
		private var tmpColor:*;

		/**
		 * @private 
		 */
		private var _disappearBoundsMode:*;

		public function TrailGeometry(owner:TrailFilter = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function _getType():Number{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy():void{}
		public function clear():void{}
	}

}
