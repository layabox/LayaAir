/*[IF-FLASH]*/
package laya.ani.swf {
	improt laya.display.Sprite;
	improt laya.utils.Byte;
	improt laya.utils.Handler;
	public class MovieClip extends laya.display.Sprite {
		protected static var _ValueList:Array;
		protected var _start:Number;
		protected var _Pos:Number;
		protected var _data:Byte;
		protected var _curIndex:Number;
		protected var _preIndex:Number;
		protected var _playIndex:Number;
		protected var _playing:Boolean;
		protected var _ended:Boolean;
		protected var _count:Number;
		protected var _loadedImage:*;
		protected var _labels:*;
		public var basePath:String;
		private var _atlasPath:*;
		private var _url:*;
		private var _isRoot:*;
		private var _completeHandler:*;
		private var _endFrame:*;
		public var interval:Number;
		public var loop:Boolean;

		public function MovieClip(parentMovieClip:MovieClip = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function _onDisplay(value:Boolean = null):void{}
		public function updates():void{}
		public var index:Number;
		public function addLabel(label:String,index:Number):void{}
		public function removeLabel(label:String):void{}
		public function get count():Number{};
		public function get playing():Boolean{};
		private var _update:*;
		public function stop():void{}
		public function gotoAndStop(index:Number):void{}
		private var _clear:*;
		public function play(index:Number = null,loop:Boolean = null):void{}
		private var _displayFrame:*;
		private var _reset:*;
		private var _parseFrame:*;
		public var url:String;
		public function load(url:String,atlas:Boolean = null,atlasPath:String = null):void{}
		private var _onLoaded:*;
		private var _initState:*;
		private var _initData:*;
		public function playTo(start:Number,end:Number,complete:Handler = null):void{}
	}

}
