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
		public function get material():Material{return null;}
		public function set material(value:Material):void{}

		/**
		 * 网格。
		 */
		public function get mesh():SkyMesh{return null;}
		public function set mesh(value:SkyMesh):void{}

		/**
		 * 创建一个新的 <code>SkyRenderer</code> 实例。
		 */

		public function SkyRenderer(){}
	}

}
