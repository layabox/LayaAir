/*[IF-FLASH]*/
package laya.d3.core.trail {
	improt laya.d3.core.trail.TrailSprite3D;
	improt laya.d3.core.Transform3D;
	improt laya.d3.core.render.BaseRender;
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.math.BoundFrustum;
	improt laya.d3.math.Matrix4x4;
	public class TrailRenderer extends laya.d3.core.render.BaseRender {

		public function TrailRenderer(owner:TrailSprite3D){}
		protected function _calculateBoundingBox():void{}
		public function _needRender(boundFrustum:BoundFrustum):Boolean{}
		public function _renderUpdate(state:RenderContext3D,transform:Transform3D):void{}
		protected var _projectionViewWorldMatrix:Matrix4x4;
		public function _renderUpdateWithCamera(context:RenderContext3D,transform:Transform3D):void{}
	}

}
