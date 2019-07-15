/*[IF-FLASH]*/
package laya.d3.core.scene {
	improt laya.d3.math.BoundBox;
	improt laya.d3.math.Ray;
	improt laya.d3.math.Vector3;
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.core.scene.IOctreeObject;
	improt laya.d3.core.scene.BoundsOctree;
	improt laya.d3.shader.Shader3D;
	public class BoundsOctreeNode {

		public function BoundsOctreeNode(octree:BoundsOctree,parent:BoundsOctreeNode,baseLength:Number,center:Vector3){}
		public function add(object:IOctreeObject):Boolean{}
		public function remove(object:IOctreeObject):Boolean{}
		public function update(object:IOctreeObject):Boolean{}
		public function shrinkIfPossible(minLength:Number):BoundsOctreeNode{}
		public function hasAnyObjects():Boolean{}
		public function getCollidingWithBoundBox(checkBound:BoundBox,result:Array):void{}
		public function getCollidingWithRay(ray:Ray,result:Array,maxDistance:Number = null):void{}
		public function getCollidingWithFrustum(context:RenderContext3D,customShader:Shader3D,replacementTag:String):void{}
		public function isCollidingWithBoundBox(checkBound:BoundBox):Boolean{}
		public function isCollidingWithRay(ray:Ray,maxDistance:Number = null):Boolean{}
		public function getBound():BoundBox{}
	}

}
