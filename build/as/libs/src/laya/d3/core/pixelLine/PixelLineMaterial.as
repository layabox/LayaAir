package laya.d3.core.pixelLine {
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;

	/**
	 * <code>PixelLineMaterial</code> 类用于实现像素线材质。
	 */
	public class PixelLineMaterial extends Material {
		public static var COLOR:Number;

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:PixelLineMaterial;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;

		/**
		 * 获取颜色。
		 * @return 颜色。
		 */

		/**
		 * 设置颜色。
		 * @param value 颜色。
		 */
		public var color:Vector4;

		/**
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/**
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		public var depthWrite:Boolean;

		/**
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/**
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		public var cull:Number;

		/**
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/**
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		public var blend:Number;

		/**
		 * 设置混合源。
		 * @param value 混合源
		 */

		/**
		 * 获取混合源。
		 * @return 混合源。
		 */
		public var blendSrc:Number;

		/**
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/**
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		public var blendDst:Number;

		/**
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/**
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		public var depthTest:Number;

		public function PixelLineMaterial(){}
	}

}
