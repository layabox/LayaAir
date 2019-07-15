/*[IF-FLASH]*/
package laya.ui {
	improt laya.display.Graphics;
	improt laya.resource.Texture;
	public class AutoBitmap extends laya.display.Graphics {
		public var autoCacheCmd:Boolean;
		private var _width:*;
		private var _height:*;
		private var _source:*;
		private var _sizeGrid:*;
		protected var _isChanged:Boolean;
		public var uv:Array;
		public function destroy():void{}
		public var sizeGrid:Array;
		public var width:Number;
		public var height:Number;
		public var source:Texture;
		protected function _setChanged():void{}
		protected function changeSource():void{}
		private var drawBitmap:*;
		private static var getTexture:*;
	}

}
