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
		public function get color():Vector4{return null;}

		/**
		 * 设置颜色。
		 * @param value 颜色。
		 */
		public function set color(value:Vector4):void{}

		/**
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */
		public function set depthWrite(value:Boolean):void{}

		/**
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		public function get depthWrite():Boolean{return null;}

		/**
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */
		public function set cull(value:Number):void{}

		/**
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		public function get cull():Number{return null;}

		/**
		 * 设置混合方式。
		 * @param value 混合方式。
		 */
		public function set blend(value:Number):void{}

		/**
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		public function get blend():Number{return null;}

		/**
		 * 设置混合源。
		 * @param value 混合源
		 */
		public function set blendSrc(value:Number):void{}

		/**
		 * 获取混合源。
		 * @return 混合源。
		 */
		public function get blendSrc():Number{return null;}

		/**
		 * 设置混合目标。
		 * @param value 混合目标
		 */
		public function set blendDst(value:Number):void{}

		/**
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		public function get blendDst():Number{return null;}

		/**
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */
		public function set depthTest(value:Number):void{}

		/**
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		public function get depthTest():Number{return null;}

		public function PixelLineMaterial(){}
	}

}
