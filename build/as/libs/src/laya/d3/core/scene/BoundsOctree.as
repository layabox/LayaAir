/*[IF-FLASH]*/
package laya.d3.core.scene {
	improt laya.d3.core.scene.IOctreeObject;
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.math.BoundBox;
	improt laya.d3.math.Ray;
	improt laya.d3.math.Vector3;
	improt laya.d3.shader.Shader3D;
	public class BoundsOctree {

		public function BoundsOctree(initialWorldSize:Number,initialWorldPos:Vector3,minNodeSize:Number,looseness:Number){}
		public function add(object:IOctreeObject):void{}
		public function remove(object:IOctreeObject):Boolean{}
		public function update(object:IOctreeObject):Boolean{}
		public function shrinkRootIfPossible():void{}
		public function addMotionObject(object:IOctreeObject):void{}
		public function removeMotionObject(object:IOctreeObject):void{}
		public function updateMotionObjects():void{}
		public function isCollidingWithBoundBox(checkBounds:BoundBox):Boolean{}
		public function isCollidingWithRay(ray:Ray,maxDistance:Number = null):Boolean{}
		public function getCollidingWithBoundBox(checkBound:BoundBox,result:Array):void{}
		public function getCollidingWithRay(ray:Ray,result:Array,maxDistance:Number = null):void{}
		public function getCollidingWithFrustum(context:RenderContext3D,shader:Shader3D,replacementTag:String):void{}
		public function getMaxBounds():BoundBox{}
	}

}
