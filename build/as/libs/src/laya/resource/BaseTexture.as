package laya.resource {
	import laya.resource.Bitmap;
	import laya.resource.FilterMode;

	/**
	 * <code>BaseTexture</code> 纹理的父类，抽象类，不允许实例。
	 */
	public class BaseTexture extends Bitmap {

		/**
		 * 是否使用mipLevel
		 */
		public function get mipmap():Boolean{
				return null;
		}

		/**
		 * 纹理格式
		 */
		public function get format():Number{
				return null;
		}

		/**
		 * 纹理横向循环模式。
		 */
		public var wrapModeU:Number;

		/**
		 * 纹理纵向循环模式。
		 */
		public var wrapModeV:Number;

		/**
		 * 缩小过滤器
		 */
		public var filterMode:FilterMode;

		/**
		 * 各向异性等级
		 */
		public var anisoLevel:Number;

		/**
		 * 获取mipmap数量。
		 */
		public function get mipmapCount():Number{
				return null;
		}
		public function get defaulteTexture():BaseTexture{
				return null;
		}

		/**
		 * 创建一个 <code>BaseTexture</code> 实例。
		 */

		public function BaseTexture(format:Number = undefined,mipMap:Boolean = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _disposeResource():void{}

		/**
		 * 通过基础数据生成mipMap。
		 */
		public function generateMipmap():void{}

		/**
		 * @deprecated use TextureFormat.FORMAT_R8G8B8 instead.
		 */
		public static var FORMAT_R8G8B8:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_R8G8B8A8 instead.
		 */
		public static var FORMAT_R8G8B8A8:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_ALPHA8 instead.
		 */
		public static var FORMAT_ALPHA8:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_DXT1 instead.
		 */
		public static var FORMAT_DXT1:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_DXT5 instead.
		 */
		public static var FORMAT_DXT5:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_ETC1RGB instead.
		 */
		public static var FORMAT_ETC1RGB:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_PVRTCRGB_2BPPV instead.
		 */
		public static var FORMAT_PVRTCRGB_2BPPV:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_PVRTCRGBA_2BPPV instead.
		 */
		public static var FORMAT_PVRTCRGBA_2BPPV:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_PVRTCRGB_4BPPV instead.
		 */
		public static var FORMAT_PVRTCRGB_4BPPV:Number;

		/**
		 * @deprecated use TextureFormat.FORMAT_PVRTCRGBA_4BPPV instead.
		 */
		public static var FORMAT_PVRTCRGBA_4BPPV:Number;

		/**
		 * @deprecated use RenderTextureFormat.R16G16B16A16 instead.
		 */
		public static var RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT:Number;

		/**
		 * @deprecated use TextureFormat.R32G32B32A32 instead.
		 */
		public static var FORMAT_R32G32B32A32:Number;

		/**
		 * @deprecated use RenderTextureDepthFormat.DEPTH_16 instead.
		 */
		public static var FORMAT_DEPTH_16:Number;

		/**
		 * @deprecated use RenderTextureDepthFormat.STENCIL_8 instead.
		 */
		public static var FORMAT_STENCIL_8:Number;

		/**
		 * @deprecated use RenderTextureDepthFormat.DEPTHSTENCIL_16_8 instead.
		 */
		public static var FORMAT_DEPTHSTENCIL_16_8:Number;

		/**
		 * @deprecated use RenderTextureDepthFormat.DEPTHSTENCIL_NONE instead.
		 */
		public static var FORMAT_DEPTHSTENCIL_NONE:Number;

		/**
		 * @deprecated use FilterMode.Point instead.
		 */
		public static var FILTERMODE_POINT:Number;

		/**
		 * @deprecated use FilterMode.Bilinear instead.
		 */
		public static var FILTERMODE_BILINEAR:Number;

		/**
		 * @deprecated use FilterMode.Trilinear instead.
		 */
		public static var FILTERMODE_TRILINEAR:Number;

		/**
		 * @deprecated use WarpMode.Repeat instead.
		 */
		public static var WARPMODE_REPEAT:Number;

		/**
		 * @deprecated use WarpMode.Clamp instead.
		 */
		public static var WARPMODE_CLAMP:Number;
	}

}
