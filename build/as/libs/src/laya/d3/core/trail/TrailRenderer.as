package laya.d3.core.trail {
	import laya.d3.core.trail.TrailSprite3D;
	import laya.d3.core.render.BaseRender;
	import laya.d3.math.Matrix4x4;

	/**
	 * <code>TrailRenderer</code> 类用于创建拖尾渲染器。
	 */
	public class TrailRenderer extends BaseRender {

		public function TrailRenderer(owner:TrailSprite3D = undefined){}
		protected var _projectionViewWorldMatrix:Matrix4x4;
	}

}
