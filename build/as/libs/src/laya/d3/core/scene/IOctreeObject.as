package laya.d3.core.scene {
	import laya.d3.core.scene.BoundsOctreeNode;
	import laya.d3.core.Bounds;

	/**
	 * <code>IOctreeObject</code> 类用于实现八叉树物体规范。
	 */
	public interface IOctreeObject {

		/**
		 * 获得八叉树节点
		 */
		function _getOctreeNode():BoundsOctreeNode;

		/**
		 * 设置八叉树节点
		 */
		function _setOctreeNode(value:BoundsOctreeNode):void;

		/**
		 * 获得动态列表中的Index
		 */
		function _getIndexInMotionList():Number;

		/**
		 * 设置动态列表中的Index
		 */
		function _setIndexInMotionList(value:Number):void;

		/**
		 * 包围盒
		 */
		function get bounds():Bounds;
	}

}
