package laya.d3.core.render {
	import laya.d3.core.Bounds;
	import laya.d3.core.material.BaseMaterial;
	import laya.d3.core.scene.BoundsOctreeNode;
	import laya.d3.core.scene.IOctreeObject;
	import laya.d3.math.Vector4;
	import laya.events.EventDispatcher;
	import laya.resource.ISingletonElement;

	/*
	 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
	 */
	public class BaseRender extends EventDispatcher implements ISingletonElement,IOctreeObject {
		public var _supportOctree:Boolean;

		/*
		 * 排序矫正值。
		 */
		public var sortingFudge:Number;

		/*
		 * 获取唯一标识ID,通常用于识别。
		 */
		public function get id():Number{
				return null;
		}

		/*
		 * 获取光照贴图的索引。
		 * @return 光照贴图的索引。
		 */

		/*
		 * 设置光照贴图的索引。
		 * @param value 光照贴图的索引。
		 */
		public var lightmapIndex:Number;

		/*
		 * 获取光照贴图的缩放和偏移。
		 * @return 光照贴图的缩放和偏移。
		 */

		/*
		 * 设置光照贴图的缩放和偏移。
		 * @param 光照贴图的缩放和偏移 。
		 */
		public var lightmapScaleOffset:Vector4;

		/*
		 * 获取是否可用。
		 * @return 是否可用。
		 */

		/*
		 * 设置是否可用。
		 * @param value 是否可用。
		 */
		public var enable:Boolean;

		/*
		 * 返回第一个实例材质,第一次使用会拷贝实例对象。
		 * @return 第一个实例材质。
		 */

		/*
		 * 设置第一个实例材质。
		 * @param value 第一个实例材质。
		 */
		public var material:BaseMaterial;

		/*
		 * 获取潜拷贝实例材质列表,第一次使用会拷贝实例对象。
		 * @return 浅拷贝实例材质列表。
		 */

		/*
		 * 设置实例材质列表。
		 * @param value 实例材质列表。
		 */
		public var materials:Array;

		/*
		 * 返回第一个材质。
		 * @return 第一个材质。
		 */

		/*
		 * 设置第一个材质。
		 * @param value 第一个材质。
		 */
		public var sharedMaterial:BaseMaterial;

		/*
		 * 获取浅拷贝材质列表。
		 * @return 浅拷贝材质列表。
		 */

		/*
		 * 设置材质列表。
		 * @param value 材质列表。
		 */
		public var sharedMaterials:Array;

		/*
		 * 获取包围盒,只读,不允许修改其值。
		 * @return 包围盒。
		 */
		public function get bounds():Bounds{
				return null;
		}

		/*
		 * 设置是否接收阴影属性
		 */

		/*
		 * 获得是否接收阴影属性
		 */
		public var receiveShadow:Boolean;

		/*
		 * 获取是否产生阴影。
		 * @return 是否产生阴影。
		 */

		/*
		 * 设置是否产生阴影。
		 * @param value 是否产生阴影。
		 */
		public var castShadow:Boolean;

		/*
		 * 是否是静态的一部分。
		 */
		public function get isPartOfStaticBatch():Boolean{
				return null;
		}

		/*
		 */
		public function _getOctreeNode():BoundsOctreeNode{
			return null;
		}

		/*
		 */
		public function _setOctreeNode(value:BoundsOctreeNode):void{}

		/*
		 */
		public function _getIndexInMotionList():Number{
			return null;
		}

		/*
		 */
		public function _setIndexInMotionList(value:Number):void{}

		/*
		 * [实现ISingletonElement接口]
		 */
		public function _getIndexInList():Number{
			return null;
		}

		/*
		 * [实现ISingletonElement接口]
		 */
		public function _setIndexInList(index:Number):void{}
	}

}
