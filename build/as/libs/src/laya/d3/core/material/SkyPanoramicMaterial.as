package laya.d3.core.material {
	import laya.resource.Texture2D;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.resource.TextureDecodeFormat;

	/**
	 * <code>SkyPanoramicMaterial</code> 类用于实现SkyPanoramicMaterial材质。
	 */
	public class SkyPanoramicMaterial extends Material {
		public static var TINTCOLOR:Number;
		public static var EXPOSURE:Number;
		public static var ROTATION:Number;
		public static var TEXTURE:Number;
		public static var TEXTURE_HDR_PARAMS:Number;

		/**
		 * 颜色。
		 */
		public var tintColor:Vector4;

		/**
		 * 曝光强度。
		 */
		public var exposure:Number;

		/**
		 * 旋转角度。
		 */
		public var rotation:Number;

		/**
		 * 全景天空纹理。
		 */
		public var panoramicTexture:Texture2D;

		/**
		 * 全景天空纹理解码格式。
		 */
		public var panoramicTextureDecodeFormat:TextureDecodeFormat;

		/**
		 * 创建一个 <code>SkyPanoramicMaterial</code> 实例。
		 */

		public function SkyPanoramicMaterial(){}
	}

}
