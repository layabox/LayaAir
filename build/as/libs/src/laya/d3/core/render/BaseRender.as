package laya.d3.core.render {
	import laya.d3.core.Bounds;
	import laya.d3.core.material.Material;
	import laya.d3.core.scene.BoundsOctreeNode;
	import laya.d3.core.scene.IOctreeObject;
	import laya.d3.math.Vector4;
	import laya.events.EventDispatcher;
	import laya.resource.ISingletonElement;

	/**
	 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
	 */
	public class BaseRender extends EventDispatcher implements ISingletonElement,IOctreeObject {

		/**
		 * 排序矫正值。
		 */
		public var sortingFudge:Number;

		/**
		 * 获取唯一标识ID,通常用于识别。
		 */
		public function get id():Number{
				return null;
		}

		/**
		 * 光照贴图的索引。
		 */
		public var lightmapIndex:Number;

		/**
		 * 光照贴图的缩放和偏移。
		 */
		public var lightmapScaleOffset:Vector4;

		/**
		 * 是否可用。
		 */
		public var enable:Boolean;

		/**
		 * 返回第一个实例材质,第一次使用会拷贝实例对象。
		 */
		public var material:Material;

		/**
		 * 潜拷贝实例材质列表,第一次使用会拷贝实例对象。
		 */
		public var materials:Array;

		/**
		 * 返回第一个材质。
		 */
		public var sharedMaterial:Material;

		/**
		 * 浅拷贝材质列表。
		 */
		public var sharedMaterials:Array;

		/**
		 * 包围盒,只读,不允许修改其值。
		 */
		public function get bounds():Bounds{
				return null;
		}

		/**
		 * 是否接收阴影属性
		 */
		public var receiveShadow:Boolean;

		/**
		 * 是否产生阴影。
		 */
		public var castShadow:Boolean;

		/**
		 * 是否是静态的一部分。
		 */
		public function get isPartOfStaticBatch():Boolean{
				return null;
		}

		/**
		 * 是否被渲染。
		 */
		public function get isRender():Boolean{
				return null;
		}

		/**
		 */
		public function _getOctreeNode():BoundsOctreeNode{
			return null;
		}

		/**
		 */
		public function _setOctreeNode(value:BoundsOctreeNode):void{}

		/**
		 */
		public function _getIndexInMotionList():Number{
			return null;
		}

		/**
		 */
		public function _setIndexInMotionList(value:Number):void{}

		/**
		 * [实现ISingletonElement接口]
		 */
		public function _getIndexInList():Number{
			return null;
		}

		/**
		 * [实现ISingletonElement接口]
		 */
		public function _setIndexInList(index:Number):void{}

		/**
		 * 标记为非静态,静态合并后可用于取消静态限制。
		 */
		public function markAsUnStatic():void{}
	}

}
