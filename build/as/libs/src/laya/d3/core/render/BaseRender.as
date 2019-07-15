/*[IF-FLASH]*/
package laya.d3.core.render {
	improt laya.d3.core.Bounds;
	improt laya.d3.core.material.BaseMaterial;
	improt laya.d3.core.scene.BoundsOctreeNode;
	improt laya.d3.core.scene.IOctreeObject;
	improt laya.d3.math.Vector4;
	improt laya.events.EventDispatcher;
	improt laya.resource.ISingletonElement;
	public class BaseRender extends laya.events.EventDispatcher implements laya.resource.ISingletonElement,laya.d3.core.scene.IOctreeObject {
		public var _supportOctree:Boolean;
		public var sortingFudge:Number;
		public function get id():Number{};
		public var lightmapIndex:Number;
		public var lightmapScaleOffset:Vector4;
		public var enable:Boolean;
		public var material:BaseMaterial;
		public var materials:Array;
		public var sharedMaterial:BaseMaterial;
		public var sharedMaterials:Array;
		public function get bounds():Bounds{};
		public var receiveShadow:Boolean;
		public var castShadow:Boolean;
		public function get isPartOfStaticBatch():Boolean{};
		public function _getOctreeNode():BoundsOctreeNode{}
		public function _setOctreeNode(value:BoundsOctreeNode):void{}
		public function _getIndexInMotionList():Number{}
		public function _setIndexInMotionList(value:Number):void{}
		public function _getIndexInList():Number{}
		public function _setIndexInList(index:Number):void{}
	}

}
