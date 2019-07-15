/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.resource.models.Mesh;
	improt laya.d3.core.Bounds;
	improt laya.d3.core.MeshRenderer;
	improt laya.d3.core.RenderableSprite3D;
	improt laya.d3.core.Sprite3D;
	improt laya.d3.core.Transform3D;
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.core.render.RenderElement;
	public class SkinnedMeshRenderer extends laya.d3.core.MeshRenderer {
		public var localBounds:Bounds;
		public var rootBone:Sprite3D;
		public function get bones():Array{};

		public function SkinnedMeshRenderer(owner:RenderableSprite3D){}
		private var _computeSkinnedData:*;
		public function _createRenderElement():RenderElement{}
		public function _onMeshChange(value:Mesh):void{}
		protected function _calculateBoundingBox():void{}
		public function _renderUpdate(context:RenderContext3D,transform:Transform3D):void{}
		public function _renderUpdateWithCamera(context:RenderContext3D,transform:Transform3D):void{}
		public function _destroy():void{}
		public function get bounds():Bounds{};
	}

}
