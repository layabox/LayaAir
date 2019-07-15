/*[IF-FLASH]*/
package laya.resource {
	improt laya.resource.Texture2D;
	improt laya.events.EventDispatcher;
	improt laya.utils.Handler;
	public class Texture extends laya.events.EventDispatcher {
		public static var DEF_UV:Float32Array;
		public static var NO_UV:Float32Array;
		public static var INV_UV:Float32Array;
		private static var _rect1:*;
		private static var _rect2:*;
		public var uvrect:Array;
		private var _destroyed:*;
		private var _bitmap:*;
		public var _uv:Array;
		private var _referenceCount:*;
		public var $_GID:Number;
		public var offsetX:Number;
		public var offsetY:Number;
		private var _w:*;
		private var _h:*;
		public var sourceWidth:Number;
		public var sourceHeight:Number;
		public var url:String;
		public var scaleRate:Number;
		public static function moveUV(offsetX:Number,offsetY:Number,uv:Array):Array{}
		public static function create(source:*,x:Number,y:Number,width:Number,height:Number,offsetX:Number = null,offsetY:Number = null,sourceWidth:Number = null,sourceHeight:Number = null):Texture{}
		public static function createFromTexture(texture:Texture,x:Number,y:Number,width:Number,height:Number):Texture{}
		public var uv:Array;
		public var width:Number;
		public var height:Number;
		public var bitmap:*;
		public function get destroyed():Boolean{};

		public function Texture(bitmap:* = null,uv:Array = null,sourceWidth:Number = null,sourceHeight:Number = null){}
		private var _onLoaded:*;
		public function getIsReady():Boolean{}
		public function setTo(bitmap:* = null,uv:Array = null,sourceWidth:Number = null,sourceHeight:Number = null):void{}
		public function load(url:String,complete:Handler = null):void{}
		public function getTexturePixels(x:Number,y:Number,width:Number,height:Number):Uint8Array{}
		public function getPixels(x:Number,y:Number,width:Number,height:Number):Uint8Array{}
		public function recoverBitmap(onok:Function = null):void{}
		public function disposeBitmap():void{}
		public function destroy(force:Boolean = null):void{}
	}

}
