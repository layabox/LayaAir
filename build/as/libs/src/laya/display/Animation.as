/*[IF-FLASH]*/
package laya.display {
	improt laya.display.AnimationBase;
	improt laya.utils.Handler;
	public class Animation extends laya.display.AnimationBase {
		public static var framesMap:*;
		protected var _frames:Array;
		protected var _url:String;

		public function Animation(){}
		public function destroy(destroyChild:Boolean = null):void{}
		public function play(start:* = null,loop:Boolean = null,name:String = null):void{}
		protected function _setFramesFromCache(name:String,showWarn:Boolean = null):Boolean{}
		private var _copyLabels:*;
		protected function _frameLoop():void{}
		protected function _displayToIndex(value:Number):void{}
		public var frames:Array;
		public var source:String;
		public var autoAnimation:String;
		public var autoPlay:Boolean;
		public function clear():AnimationBase{}
		public function loadImages(urls:Array,cacheName:String = null):Animation{}
		public function loadAtlas(url:String,loaded:Handler = null,cacheName:String = null):Animation{}
		public function loadAnimation(url:String,loaded:Handler = null,atlas:String = null):Animation{}
		private var _loadAnimationData:*;
		public static function createFrames(url:*,name:String):Array{}
		public static function clearCache(key:String):void{}
	}

}
