/*[IF-FLASH]*/
package laya.d3.core.scene {
	improt laya.d3.core.scene.BoundsOctreeNode;
	improt laya.d3.core.Bounds;
	public interface IOctreeObject {
		function _getOctreeNode():BoundsOctreeNode;
		function _setOctreeNode(value:BoundsOctreeNode):void;
		function _getIndexInMotionList():Number;
		function _setIndexInMotionList(value:Number):void;
		var bounds:Bounds;
	}

}
