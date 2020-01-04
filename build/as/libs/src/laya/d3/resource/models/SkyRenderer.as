package laya.d3.resource.models {
	import laya.d3.core.material.Material;
	import laya.d3.resource.models.SkyMesh;

	/**
	 * <code>SkyRenderer</code> 类用于实现天空渲染器。
	 */
	public class SkyRenderer {

		/**
		 * 材质。
		 */
		public var material:Material;

		/**
		 * 网格。
		 */
		public var mesh:SkyMesh;

		/**
		 * 创建一个新的 <code>SkyRenderer</code> 实例。
		 */

		public function SkyRenderer(){}
	}

}
