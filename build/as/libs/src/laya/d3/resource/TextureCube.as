package laya.d3.resource {
	import laya.utils.Handler;
	import laya.resource.BaseTexture;

	/**
	 * <code>TextureCube</code> 类用于生成立方体纹理。
	 */
	public class TextureCube extends BaseTexture {

		/**
		 * TextureCube资源。
		 */
		public static var TEXTURECUBE:String;

		/**
		 * @private 
		 */
		private static var _blackTexture:*;

		/**
		 * @private 
		 */
		private static var _grayTexture:*;

		/**
		 * 黑色纯色纹理。
		 */
		public static function get blackTexture():TextureCube{
				return null;
		}

		/**
		 * 灰色纯色纹理。
		 */
		public static function get grayTexture():TextureCube{
				return null;
		}

		/**
		 * @inheritDoc 
		 */
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):TextureCube{
			return null;
		}

		/**
		 * @inheritDoc 
		 */
		public static function _parseBin(data:*,propertyParams:* = null,constructParams:Array = null):TextureCube{
			return null;
		}

		/**
		 * 加载TextureCube。
		 * @param url TextureCube地址。
		 * @param complete 完成回调。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * 创建一个 <code>TextureCube</code> 实例。
		 * @param format 贴图格式。
		 * @param mipmap 是否生成mipmap。
		 */

		public function TextureCube(size:Number = undefined,format:Number = undefined,mipmap:Boolean = undefined){}

		/**
		 * @private 
		 */
		private var _setPixels:*;

		/**
		 * 通过六张图片源填充纹理。
		 * @param 图片源数组 。
		 */
		public function setSixSideImageSources(source:Array,premultiplyAlpha:Boolean = null):void{}

		/**
		 * 通过六张图片源填充纹理。
		 * @param 图片源数组 。
		 */
		public function setSixSidePixels(pixels:Array,miplevel:Number = null):void{}

		/**
		 * 通过图源设置一个面的颜色。
		 * @param face 面。
		 * @param imageSource 图源。
		 * @param miplevel 层级。
		 */
		public function setImageSource(face:*,imageSource:*,miplevel:Number = null):void{}
	}

}
