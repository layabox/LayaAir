package laya.d3.core.pixelLine {
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;

	/**
	 * <code>PixelLineMaterial</code> 类用于实现像素线材质。
	 */
	public class PixelLineMaterial extends Material {

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:PixelLineMaterial;

		/**
		 * 获取颜色。
		 * @return 颜色。
		 */
		public function get color():Vector4{return null;}

		/**
		 * 设置颜色。
		 * @param value 颜色。
		 */
		public function set color(value:Vector4):void{}

		/**
		 * 创建一个 <code>PixelLineMaterial</code> 实例。
		 */

		public function PixelLineMaterial(){}
	}

}
