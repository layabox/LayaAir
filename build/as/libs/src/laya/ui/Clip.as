/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.AutoBitmap;
	improt laya.resource.Texture;
	improt laya.utils.Handler;
	public class Clip extends laya.ui.UIComponent {
		protected var _sources:Array;
		protected var _bitmap:AutoBitmap;
		protected var _skin:String;
		protected var _clipX:Number;
		protected var _clipY:Number;
		protected var _clipWidth:Number;
		protected var _clipHeight:Number;
		protected var _autoPlay:Boolean;
		protected var _interval:Number;
		protected var _complete:Handler;
		protected var _isPlaying:Boolean;
		protected var _index:Number;
		protected var _clipChanged:Boolean;
		protected var _group:String;
		protected var _toIndex:Number;

		public function Clip(url:String = null,clipX:Number = null,clipY:Number = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		public function dispose():void{}
		protected function createChildren():void{}
		protected function _onDisplay(e:Boolean = null):void{}
		public var skin:String;
		protected function _skinLoaded():void{}
		public var clipX:Number;
		public var clipY:Number;
		public var clipWidth:Number;
		public var clipHeight:Number;
		protected function changeClip():void{}
		protected function loadComplete(url:String,img:Texture):void{}
		public var sources:Array;
		public var group:String;
		public var width:Number;
		public var height:Number;
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		public var sizeGrid:String;
		public var index:Number;
		public function get total():Number{};
		public var autoPlay:Boolean;
		public var interval:Number;
		public var isPlaying:Boolean;
		public function play(from:Number = null,to:Number = null):void{}
		protected function _loop():void{}
		public function stop():void{}
		public var dataSource:*;
		public function get bitmap():AutoBitmap{};
		protected function _setClipChanged():void{}
	}

}
