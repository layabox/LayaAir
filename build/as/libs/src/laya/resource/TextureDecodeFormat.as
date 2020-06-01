
/**
 * 纹理解码格式。
 */
package laya.resource {

	public class TextureDecodeFormat {

		/**
		 * 常规解码方式,直接采样纹理颜色。
		 */
		public static var Normal:Number = 0;

		/**
		 * 按照RGBM方式解码并计算最终RGB颜色。
		 */
		public static var RGBM:Number = 1;

	}
}