/*[IF-FLASH]*/
package laya.display {
	improt laya.display.Sprite;
	improt laya.display.BitmapFont;
	improt laya.display.css.SpriteStyle;
	improt laya.display.css.TextStyle;
	improt laya.maths.Point;
	improt laya.maths.Rectangle;
	improt laya.utils.WordText;
	public class Text extends laya.display.Sprite {
		public static var VISIBLE:String;
		public static var SCROLL:String;
		public static var HIDDEN:String;
		public static var defaultFontSize:Number;
		public static var defaultFont:String;
		public static function defaultFontStr():String{}
		public static var langPacks:*;
		public static var isComplexText:Boolean;
		public static var fontFamilyMap:*;
		public static var _testWord:String;
		private static var _bitmapFonts:*;
		public static var CharacterCache:Boolean;
		public static var RightToLeft:Boolean;
		private var _clipPoint:*;
		protected var _text:String;
		protected var _isChanged:Boolean;
		protected var _textWidth:Number;
		protected var _textHeight:Number;
		protected var _lines:Array;
		protected var _lineWidths:Array;
		protected var _startX:Number;
		protected var _startY:Number;
		protected var _words:Array;
		protected var _charSize:*;
		protected var _valign:String;
		private var _singleCharRender:*;
		public var overflow:String;

		public function Text(){}
		public function getStyle():SpriteStyle{}
		protected function _getTextStyle():TextStyle{}
		public static function registerBitmapFont(name:String,bitmapFont:BitmapFont):void{}
		public static function unregisterBitmapFont(name:String,destroy:Boolean = null):void{}
		public function destroy(destroyChild:Boolean = null):void{}
		public function getGraphicBounds(realSize:Boolean = null):Rectangle{}
		public var width:Number;
		public var height:Number;
		public function get textWidth():Number{};
		public function get textHeight():Number{};
		public var text:String;
		public function get_text():String{}
		public function set_text(value:String):void{}
		public function lang(text:String,arg1:* = null,arg2:* = null,arg3:* = null,arg4:* = null,arg5:* = null,arg6:* = null,arg7:* = null,arg8:* = null,arg9:* = null,arg10:* = null):void{}
		public var font:String;
		public var fontSize:Number;
		public var bold:Boolean;
		public var color:String;
		public function get_color():String{}
		public function set_color(value:String):void{}
		public var italic:Boolean;
		public var align:String;
		public var valign:String;
		public var wordWrap:Boolean;
		public var leading:Number;
		public var padding:Array;
		public var bgColor:String;
		public function set_bgColor(value:String):void{}
		public function get_bgColor():String{}
		public var borderColor:String;
		public var stroke:Number;
		public var strokeColor:String;
		protected var isChanged:Boolean;
		protected function _getContextFont():String{}
		protected function _isPassWordMode():Boolean{}
		protected function _getPassWordTxt(txt:String):String{}
		protected function _renderText():void{}
		private var _drawUnderline:*;
		public function typeset():void{}
		private var _evalTextSize:*;
		private var _checkEnabledViewportOrNot:*;
		public function changeText(text:String):void{}
		protected function _parseLines(text:String):void{}
		protected function _parseLine(line:String,wordWrapWidth:Number):void{}
		private var _getTextWidth:*;
		private var _getWordWrapWidth:*;
		public function getCharPoint(charIndex:Number,out:Point = null):Point{}
		public var scrollX:Number;
		public var scrollY:Number;
		public function get maxScrollX():Number{};
		public function get maxScrollY():Number{};
		public function get lines():Array{};
		public var underlineColor:String;
		public var underline:Boolean;
		public var singleCharRender:Boolean;
	}

}
