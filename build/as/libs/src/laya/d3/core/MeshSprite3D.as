/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.RenderableSprite3D;
	improt laya.d3.core.MeshFilter;
	improt laya.d3.core.MeshRenderer;
	improt laya.d3.resource.models.Mesh;
	improt laya.display.Node;
	public class MeshSprite3D extends laya.d3.core.RenderableSprite3D {
		private var _meshFilter:*;
		public function get meshFilter():MeshFilter{};
		public function get meshRenderer():MeshRenderer{};

		public function MeshSprite3D(mesh:Mesh = null,name:String = null){}
		public function _parse(data:*,spriteMap:*):void{}
		public function _addToInitStaticBatchManager():void{}
		public function _cloneTo(destObject:*,rootSprite:Node,dstSprite:Node):void{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
