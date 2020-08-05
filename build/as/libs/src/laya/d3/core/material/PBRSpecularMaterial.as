package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.PBRMaterial;

	/**
	 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
	 */
	public class PBRSpecularMaterial extends PBRMaterial {

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:PBRSpecularMaterial;

		/**
		 * 高光贴图。
		 */
		public function get specularTexture():BaseTexture{return null;}
		public function set specularTexture(value:BaseTexture):void{}

		/**
		 * 高光颜色。
		 */
		public function get specularColor():Vector4{return null;}
		public function set specularColor(value:Vector4):void{}

		/**
		 * 创建一个 <code>PBRSpecularMaterial</code> 实例。
		 */

		public function PBRSpecularMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
