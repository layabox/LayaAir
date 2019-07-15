/*[IF-FLASH]*/
package laya.resource {
	improt laya.resource.BaseTexture;
	improt laya.utils.Handler;
	public class Texture2D extends laya.resource.BaseTexture {
		public static var TEXTURE2D:String;
		public static var grayTexture:Texture2D;
		public static var whiteTexture:Texture2D;
		public static var blackTexture:Texture2D;
		public static function load(url:String,complete:Handler):void{}
		private var _canRead:*;
		private var _pixels:*;
		public function get defaulteTexture():BaseTexture{};

		public function Texture2D(width:Number = null,height:Number = null,format:Number = null,mipmap:Boolean = null,canRead:Boolean = null){}
		private var _setPixels:*;
		private var _calcualatesCompressedDataSize:*;
		private var _pharseDDS:*;
		private var _pharseKTX:*;
		private var _pharsePVR:*;
		public function loadImageSource(source:*,premultiplyAlpha:Boolean = null):void{}
		public function setPixels(pixels:Uint8Array,miplevel:Number = null):void{}
		public function setSubPixels(x:Number,y:Number,width:Number,height:Number,pixels:Uint8Array,miplevel:Number = null):void{}
		public function setCompressData(data:ArrayBuffer):void{}
		protected function _recoverResource():void{}
		public function getPixels():Uint8Array{}
	}

}
