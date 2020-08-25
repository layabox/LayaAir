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
		public function get tintColor():Vector4{return null;}
		public function set tintColor(value:Vector4):void{}

		/**
		 * 曝光强度。
		 */
		public function get exposure():Number{return null;}
		public function set exposure(value:Number):void{}

		/**
		 * 旋转角度。
		 */
		public function get rotation():Number{return null;}
		public function set rotation(value:Number):void{}

		/**
		 * 全景天空纹理。
		 */
		public function get panoramicTexture():Texture2D{return null;}
		public function set panoramicTexture(value:Texture2D):void{}

		/**
		 * 全景天空纹理解码格式。
		 */
		public function get panoramicTextureDecodeFormat():TextureDecodeFormat{return null;}
		public function set panoramicTextureDecodeFormat(value:TextureDecodeFormat):void{}

		/**
		 * 创建一个 <code>SkyPanoramicMaterial</code> 实例。
		 */

		public function SkyPanoramicMaterial(){}
	}

}
