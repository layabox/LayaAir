package laya.d3.core.scene {
	import laya.d3.core.scene.IOctreeObject;
	import laya.d3.core.render.RenderContext3D;
	import laya.d3.math.BoundBox;
	import laya.d3.math.Ray;
	import laya.d3.math.Vector3;
	import laya.d3.shader.Shader3D;
	import laya.d3.graphics.FrustumCulling;

	/**
	 * <code>BoundsOctree</code> 类用于创建八叉树。
	 */
	public class BoundsOctree {

		/**
		 * 创建一个 <code>BoundsOctree</code> 实例。
		 * @param initialWorldSize 八叉树尺寸
		 * @param initialWorldPos 八叉树中心
		 * @param minNodeSize 节点最小尺寸
		 * @param loosenessVal 松散值
		 */

		public function BoundsOctree(initialWorldSize:Number = undefined,initialWorldPos:Vector3 = undefined,minNodeSize:Number = undefined,looseness:Number = undefined){}

		/**
		 * 添加物体
		 * @param object 
		 */
		public function add(object:IOctreeObject):void{}

		/**
		 * 移除物体
		 * @return 是否成功
		 */
		public function remove(object:IOctreeObject):Boolean{
			return null;
		}

		/**
		 * 更新物体
		 */
		public function update(object:IOctreeObject):Boolean{
			return null;
		}

		/**
		 * 如果可能则收缩根节点。
		 */
		public function shrinkRootIfPossible():void{}

		/**
		 * 添加运动物体。
		 * @param 运动物体 。
		 */
		public function addMotionObject(object:IOctreeObject):void{}

		/**
		 * 移除运动物体。
		 * @param 运动物体 。
		 */
		public function removeMotionObject(object:IOctreeObject):void{}

		/**
		 * 更新所有运动物体。
		 */
		public function updateMotionObjects():void{}

		/**
		 * 获取是否与指定包围盒相交。
		 * @param checkBound AABB包围盒。
		 * @return 是否相交。
		 */
		public function isCollidingWithBoundBox(checkBounds:BoundBox):Boolean{
			return null;
		}

		/**
		 * 获取是否与指定射线相交。
		 * @param ray 射线。
		 * @param maxDistance 射线的最大距离。
		 * @return 是否相交。
		 */
		public function isCollidingWithRay(ray:Ray,maxDistance:Number = null):Boolean{
			return null;
		}

		/**
		 * 获取与指定包围盒相交的物体列表。
		 * @param checkBound AABB包围盒。
		 * @param result 相交物体列表
		 */
		public function getCollidingWithBoundBox(checkBound:BoundBox,result:Array):void{}

		/**
		 * 获取与指定射线相交的的物理列表。
		 * @param ray 射线。
		 * @param result 相交物体列表。
		 * @param maxDistance 射线的最大距离。
		 */
		public function getCollidingWithRay(ray:Ray,result:Array,maxDistance:Number = null):void{}

		/**
		 * 获取与指定视锥相交的的物理列表。
		 * @param 渲染上下文 。
		 */
		public function getCollidingWithFrustum(cameraCullInfo:CameraCullInfo,context:RenderContext3D,shader:Shader3D,replacementTag:String,isShadowCasterCull:Boolean):void{}

		/**
		 * 获取最大包围盒
		 * @return 最大包围盒
		 */
		public function getMaxBounds():BoundBox{
			return null;
		}
	}

}
