/*[IF-FLASH]*/
package laya.webgl.text {
	improt laya.resource.Resource;
	improt laya.webgl.text.CharRenderInfo;
	public interface ITextRender {
		var atlasWidth:Number;
		var checkCleanTextureDt:Number;
		var debugUV:Boolean;
		var isWan1Wan:Boolean;
		var destroyUnusedTextureDt:Number;
	}

}
	public class TextTexture extends laya.resource.Resource {
		public static var gTextRender:ITextRender;
		private static var pool:*;
		private static var poolLen:*;
		private static var cleanTm:*;
		public var genID:Number;
		public var bitmap:*;
		public var curUsedCovRate:Number;
		public var curUsedCovRateAtlas:Number;
		public var lastTouchTm:Number;
		public var ri:CharRenderInfo;

		public function TextTexture(textureW:Number,textureH:Number){}
		public function recreateResource():void{}
		public function addChar(data:ImageData,x:Number,y:Number,uv:Array = null):Array{}
		public function addCharCanvas(canv:*,x:Number,y:Number,uv:Array = null):Array{}
		public function fillWhite():void{}
		public function discard():void{}
		public static function getTextTexture(w:Number,h:Number):TextTexture{}
		public function destroy():void{}
		public static function clean():void{}
		public function touchRect(ri:CharRenderInfo,curloop:Number):void{}
		public function get texture():*{};
		public function drawOnScreen(x:Number,y:Number):void{}
	}
