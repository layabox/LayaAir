/*[IF-FLASH]*/
package laya.display {
	improt laya.resource.Texture;
	improt laya.utils.Handler;
	public class BitmapFont {
		private var _texture:*;
		private var _fontCharDic:*;
		private var _fontWidthMap:*;
		private var _complete:*;
		private var _path:*;
		private var _maxWidth:*;
		private var _spaceWidth:*;
		private var _padding:*;
		public var fontSize:Number;
		public var autoScaleSize:Boolean;
		public var letterSpacing:Number;
		public function loadFont(path:String,complete:Handler):void{}
		private var _onLoaded:*;
		public function parseFont(xml:XMLDocument,texture:Texture):void{}
		public function parseFont2(xml:XMLDocument,texture:Texture):void{}
		public function getCharTexture(char:String):Texture{}
		public function destroy():void{}
		public function setSpaceWidth(spaceWidth:Number):void{}
		public function getCharWidth(char:String):Number{}
		public function getTextWidth(text:String):Number{}
		public function getMaxWidth():Number{}
		public function getMaxHeight():Number{}
	}

}
