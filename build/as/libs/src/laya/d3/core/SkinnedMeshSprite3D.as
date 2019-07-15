/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.display.Node;
	improt laya.d3.component.Animator;
	improt laya.d3.resource.models.Mesh;
	improt laya.d3.core.Avatar;
	improt laya.d3.core.MeshFilter;
	improt laya.d3.core.RenderableSprite3D;
	improt laya.d3.core.SkinnedMeshRenderer;
	public class SkinnedMeshSprite3D extends laya.d3.core.RenderableSprite3D {
		public static var BONES:Number;
		public function get meshFilter():MeshFilter{};
		public function get skinnedMeshRenderer():SkinnedMeshRenderer{};

		public function SkinnedMeshSprite3D(mesh:Mesh = null,name:String = null){}
		public function _parse(data:*,spriteMap:*):void{}
		protected function _changeHierarchyAnimator(animator:Animator):void{}
		protected function _changeAnimatorAvatar(avatar:Avatar):void{}
		public function _cloneTo(destObject:*,srcRoot:Node,dstRoot:Node):void{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
