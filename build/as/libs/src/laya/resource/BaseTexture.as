/*[IF-FLASH]*/
package laya.resource {
	improt laya.resource.Bitmap;
	public class BaseTexture extends laya.resource.Bitmap {
		public static var WARPMODE_REPEAT:Number;
		public static var WARPMODE_CLAMP:Number;
		public static var FILTERMODE_POINT:Number;
		public static var FILTERMODE_BILINEAR:Number;
		public static var FILTERMODE_TRILINEAR:Number;
		public static var FORMAT_R8G8B8:Number;
		public static var FORMAT_R8G8B8A8:Number;
		public static var FORMAT_ALPHA8:Number;
		public static var FORMAT_DXT1:Number;
		public static var FORMAT_DXT5:Number;
		public static var FORMAT_ETC1RGB:Number;
		public static var FORMAT_PVRTCRGB_2BPPV:Number;
		public static var FORMAT_PVRTCRGBA_2BPPV:Number;
		public static var FORMAT_PVRTCRGB_4BPPV:Number;
		public static var FORMAT_PVRTCRGBA_4BPPV:Number;
		public static var RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT:Number;
		public static var FORMAT_DEPTH_16:Number;
		public static var FORMAT_STENCIL_8:Number;
		public static var FORMAT_DEPTHSTENCIL_16_8:Number;
		public static var FORMAT_DEPTHSTENCIL_NONE:Number;
		protected var _readyed:Boolean;
		protected var _glTextureType:Number;
		protected var _glTexture:*;
		protected var _format:Number;
		protected var _mipmap:Boolean;
		protected var _wrapModeU:Number;
		protected var _wrapModeV:Number;
		protected var _filterMode:Number;
		protected var _anisoLevel:Number;
		protected var _mipmapCount:Number;
		public function get mipmap():Boolean{};
		public function get format():Number{};
		public var wrapModeU:Number;
		public var wrapModeV:Number;
		public var filterMode:Number;
		public var anisoLevel:Number;
		public function get mipmapCount():Number{};
		public function get defaulteTexture():BaseTexture{};

		public function BaseTexture(format:Number,mipMap:Boolean){}
		protected function _getFormatByteCount():Number{}
		protected function _isPot(size:Number):Boolean{}
		protected function _getGLFormat():Number{}
		protected function _setFilterMode(value:Number):void{}
		protected function _setWarpMode(orientation:Number,mode:Number):void{}
		protected function _setAnisotropy(value:Number):void{}
		protected function _disposeResource():void{}
		public function generateMipmap():void{}
	}

}
