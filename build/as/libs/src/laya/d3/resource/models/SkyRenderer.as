package laya.d3.resource.models {
	import laya.d3.core.material.BaseMaterial;
	import laya.d3.resource.models.SkyMesh;

	/*
	 * <code>SkyRenderer</code> 类用于实现天空渲染器。
	 */
	public class SkyRenderer {
		private static var _tempMatrix0:*;
		private static var _tempMatrix1:*;

		/*
		 * 获取材质。
		 * @return 材质。
		 */

		/*
		 * 设置材质。
		 * @param 材质 。
		 */
		public var material:BaseMaterial;

		/*
		 * 获取网格。
		 * @return 网格。
		 */

		/*
		 * 设置网格。
		 * @param 网格 。
		 */
		public var mesh:SkyMesh;

		/*
		 * 创建一个新的 <code>SkyRenderer</code> 实例。
		 */

		public function SkyRenderer(){}
	}

}
