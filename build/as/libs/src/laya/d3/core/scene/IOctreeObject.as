package laya.d3.core.scene {
	import laya.d3.core.scene.BoundsOctreeNode;
	import laya.d3.core.Bounds;

	/**
	 * <code>IOctreeObject</code> 类用于实现八叉树物体规范。
	 */
	public interface IOctreeObject {
		function _getOctreeNode():BoundsOctreeNode;
		function _setOctreeNode(value:BoundsOctreeNode):void;
		function _getIndexInMotionList():Number;
		function _setIndexInMotionList(value:Number):void;
		function get bounds():Bounds;
	}

}
