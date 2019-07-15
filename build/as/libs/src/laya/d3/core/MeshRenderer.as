/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.math.BoundFrustum;
	improt laya.d3.core.RenderableSprite3D;
	improt laya.d3.core.Transform3D;
	improt laya.d3.core.render.BaseRender;
	improt laya.d3.core.render.RenderContext3D;
	public class MeshRenderer extends laya.d3.core.render.BaseRender {

		public function MeshRenderer(owner:RenderableSprite3D){}
		protected function _calculateBoundingBox():void{}
		public function _needRender(boundFrustum:BoundFrustum):Boolean{}
		public function _renderUpdate(context:RenderContext3D,transform:Transform3D):void{}
		public function _renderUpdateWithCamera(context:RenderContext3D,transform:Transform3D):void{}
		public function _renderUpdateWithCameraForNative(context:RenderContext3D,transform:Transform3D):void{}
		public function _destroy():void{}
	}

}
