package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.core.material.PBRMaterial;

	/**
	 * <code>PBRStandardMaterial</code> 类用于实现PBR材质。
	 */
	public class PBRStandardMaterial extends PBRMaterial {

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:PBRStandardMaterial;

		/**
		 * 金属光滑度贴图。
		 */
		public function get metallicGlossTexture():BaseTexture{return null;}
		public function set metallicGlossTexture(value:BaseTexture):void{}

		/**
		 * 获取金属度,范围为0到1。
		 */
		public function get metallic():Number{return null;}
		public function set metallic(value:Number):void{}

		/**
		 * 光滑度数据源,0或1。
		 */
		public function get smoothnessSource():*{return null;}
		public function set smoothnessSource(value:*):void{}

		/**
		 * 创建一个 <code>PBRStandardMaterial</code> 实例。
		 */

		public function PBRStandardMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
