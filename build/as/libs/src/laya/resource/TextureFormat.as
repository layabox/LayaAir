package laya.resource {

	public class TextureFormat {

		/**
		 * 纹理格式_R8G8B8。
		 */
		public static var R8G8B8:Number = 0;

		/**
		 * 纹理格式_R8G8B8A8。
		 */
		public static var R8G8B8A8:Number = 1;

		/**
		 * RGB格式纹理,R通道5位，G通道6位，B通道5位。
		 */
		public static var R5G6B5:Number = 16;

		/**
		 * 纹理格式_ALPHA8。
		 */
		public static var Alpha8:Number = 2;

		/**
		 * 纹理格式_DXT1。
		 */
		public static var DXT1:Number = 3;

		/**
		 * 纹理格式_DXT5。
		 */
		public static var DXT5:Number = 4;

		/**
		 * 纹理格式_ETC2RGB。
		 */
		public static var ETC1RGB:Number = 5;
		public static var ETC2RGB:Number = 6;
		public static var ETC2RGBA:Number = 7;

		/**
		 * 纹理格式_ETC2RGB_PUNCHTHROUGHALPHA。
		 */

		/**
		 * 纹理格式_PVRTCRGB_2BPPV。
		 */
		public static var ETC2RGB_Alpha8:Number = 8;
		public static var ETC2SRGB:Number = 28;
		public static var PVRTCRGB_2BPPV:Number = 9;

		/**
		 * 纹理格式_PVRTCRGBA_2BPPV。
		 */
		public static var PVRTCRGBA_2BPPV:Number = 10;

		/**
		 * 纹理格式_PVRTCRGB_4BPPV。
		 */
		public static var PVRTCRGB_4BPPV:Number = 11;

		/**
		 * 纹理格式_PVRTCRGBA_4BPPV。
		 */
		public static var PVRTCRGBA_4BPPV:Number = 12;

		/**
		 * RGBA格式纹理,每个通道32位浮点数。
		 */
		public static var R32G32B32A32:Number = 15;

		/**
		 * RGBA格式纹理，每个通道16位浮点数。
		 */
		public static var R16G16B16A16:Number = 17;

		/**
		 * ASTC 4x4
		 */
		public static var ASTC4x4:Number = 18;

		/**
		 * ASTC sRGB 4x4
		 */
		public static var ASTC4x4SRGB:Number = 23;

		/**
		 * ASTC 6x6
		 */
		public static var ASTC6x6:Number = 19;

		/**
		 * ASTC  6x6
		 */
		public static var ASTC6x6SRGB:Number = 24;

		/**
		 * ASTC 8x8
		 */
		public static var ASTC8x8:Number = 20;
		public static var ASTC8x8SRGB:Number = 25;

		/**
		 * ASTC 10x10
		 */
		public static var ASTC10x10:Number = 21;
		public static var ASTC10x10SRGB:Number = 26;

		/**
		 * ASTC 12x12
		 */
		public static var ASTC12x12:Number = 22;
		public static var ASTC12x12SRGB:Number = 27;

		/**
		 * ktx图片
		 */
		public static var KTXTEXTURE:String = -1;

		/**
		 * pvr图片
		 */
		public static var PVRTEXTURE:String = -2;

	}
}