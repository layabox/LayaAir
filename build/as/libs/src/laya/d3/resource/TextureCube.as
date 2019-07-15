/*[IF-FLASH]*/
package laya.d3.resource {
	improt laya.utils.Handler;
	improt laya.resource.BaseTexture;
	public class TextureCube extends laya.resource.BaseTexture {
		public static var TEXTURECUBE:String;
		public static var grayTexture:TextureCube;
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):TextureCube{}
		public static function load(url:String,complete:Handler):void{}
		public function get defaulteTexture():BaseTexture{};

		public function TextureCube(size:Number,format:Number = null,mipmap:Boolean = null){}
		private var _setPixels:*;
		public function setSixSideImageSources(source:Array,premultiplyAlpha:Boolean = null):void{}
		public function setSixSidePixels(pixels:Array,miplevel:Number = null):void{}
		protected function _recoverResource():void{}
	}

}
