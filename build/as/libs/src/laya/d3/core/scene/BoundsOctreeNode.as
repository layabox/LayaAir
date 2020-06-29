package laya.d3.core.scene {
	import laya.d3.math.BoundBox;
	import laya.d3.math.Ray;
	import laya.d3.math.Vector3;
	import laya.d3.core.render.RenderContext3D;
	import laya.d3.core.scene.IOctreeObject;
	import laya.d3.core.scene.BoundsOctree;
	import laya.d3.shader.Shader3D;
	import laya.d3.graphics.FrustumCulling;

	/**
	 * <code>BoundsOctreeNode</code> 类用于创建八叉树节点。
	 */
	public class BoundsOctreeNode {

		/**
		 * 创建一个 <code>BoundsOctreeNode</code> 实例。
		 * @param octree 所属八叉树。
		 * @param parent 父节点。
		 * @param baseLength 节点基本长度。
		 * @param center 节点的中心位置。
		 */

		public function BoundsOctreeNode(octree:BoundsOctree = undefined,parent:BoundsOctreeNode = undefined,baseLength:Number = undefined,center:Vector3 = undefined){}

		/**
		 * 添加指定物体。
		 * @param object 指定物体。
		 */
		public function add(object:IOctreeObject):Boolean{
			return null;
		}

		/**
		 * 移除指定物体。
		 * @param obejct 指定物体。
		 * @return 是否成功。
		 */
		public function remove(object:IOctreeObject):Boolean{
			return null;
		}

		/**
		 * 更新制定物体，
		 * @param obejct 指定物体。
		 * @return 是否成功。
		 */
		public function update(object:IOctreeObject):Boolean{
			return null;
		}

		/**
		 * 收缩八叉树节点。
		 * -所有物体都在根节点的八分之一区域
		 * -该节点无子节点或有子节点但1/8的子节点不包含物体
		 * @param minLength 最小尺寸。
		 * @return 新的根节点。
		 */
		public function shrinkIfPossible(minLength:Number):BoundsOctreeNode{
			return null;
		}

		/**
		 * 检查该节点和其子节点是否包含任意物体。
		 * @return 是否包含任意物体。
		 */
		public function hasAnyObjects():Boolean{
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
		 * @param ray 射线。.
		 * @param result 相交物体列表。
		 */
		public function getCollidingWithFrustum(cameraCullInfo:CameraCullInfo,context:RenderContext3D,customShader:Shader3D,replacementTag:String,isShadowCasterCull:Boolean):void{}

		/**
		 * 获取是否与指定包围盒相交。
		 * @param checkBound AABB包围盒。
		 * @return 是否相交。
		 */
		public function isCollidingWithBoundBox(checkBound:BoundBox):Boolean{
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
		 * 获取包围盒。
		 */
		public function getBound():BoundBox{
			return null;
		}
	}

}
