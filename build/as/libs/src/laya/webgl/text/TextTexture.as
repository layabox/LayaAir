package laya.webgl.text {
	import laya.resource.Resource;
	import laya.webgl.text.CharRenderInfo;
	public class TextTexture extends Resource {
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

		public function TextTexture(textureW:Number = undefined,textureH:Number = undefined){}
		public function recreateResource():void{}

		/**
		 * @param data 
		 * @param x 拷贝位置。
		 * @param y 
		 * @param uv 
		 * @return uv数组  如果uv不为空就返回传入的uv，否则new一个数组
		 */
		public function addChar(data:ImageData,x:Number,y:Number,uv:Array = null):Array{
			return null;
		}

		/**
		 * 玩一玩不支持 getImageData
		 * @param canv 
		 * @param x 
		 * @param y 
		 */
		public function addCharCanvas(canv:*,x:Number,y:Number,uv:Array = null):Array{
			return null;
		}

		/**
		 * 填充白色。调试用。
		 */
		public function fillWhite():void{}
		public function discard():void{}
		public static function getTextTexture(w:Number,h:Number):TextTexture{
			return null;
		}

		/**
		 * @override 
		 */
		override public function destroy():void{}

		/**
		 * 定期清理
		 * 为了简单，只有发生 getAPage 或者 discardPage的时候才检测是否需要清理
		 */
		public static function clean():void{}
		public function touchRect(ri:CharRenderInfo,curloop:Number):void{}
		public function get texture():*{
				return null;
		}
		public function drawOnScreen(x:Number,y:Number):void{}
	}

}
