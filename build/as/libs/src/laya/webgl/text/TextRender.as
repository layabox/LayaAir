/*[IF-FLASH]*/
package laya.webgl.text {
	improt laya.webgl.text.TextAtlas;
	improt laya.display.Sprite;
	improt laya.resource.Context;
	improt laya.utils.FontInfo;
	improt laya.utils.HTMLChar;
	improt laya.utils.WordText;
	improt laya.webgl.text.CharRenderInfo;
	public class TextRender {
		public static var useOldCharBook:Boolean;
		public static var atlasWidth:Number;
		public static var noAtlas:Boolean;
		public static var forceSplitRender:Boolean;
		public static var forceWholeRender:Boolean;
		public static var scaleFontWithCtx:Boolean;
		public static var standardFontSize:Number;
		public static var destroyAtlasDt:Number;
		public static var checkCleanTextureDt:Number;
		public static var destroyUnusedTextureDt:Number;
		public static var cleanMem:Number;
		public static var isWan1Wan:Boolean;
		public static var showLog:Boolean;
		public static var debugUV:Boolean;
		private var fontSizeInfo:*;
		public static var atlasWidth2:Number;
		private var charRender:*;
		private static var tmpRI:*;
		private static var pixelBBX:*;
		private var mapFont:*;
		private var fontID:*;
		private var mapColor:*;
		private var colorID:*;
		private var fontScaleX:*;
		private var fontScaleY:*;
		private var _curStrPos:*;
		public static var textRenderInst:TextRender;
		public var textAtlases:Array;
		private var isoTextures:*;
		private var bmpData32:*;
		private static var imgdtRect:*;
		private var lastFont:*;
		private var fontSizeW:*;
		private var fontSizeH:*;
		private var fontSizeOffX:*;
		private var fontSizeOffY:*;
		private var renderPerChar:*;
		private var tmpAtlasPos:*;
		private var textureMem:*;
		private var fontStr:*;
		public static var simClean:Boolean;

		public function TextRender(){}
		public function setFont(font:FontInfo):void{}
		public function getNextChar(str:String):String{}
		public function filltext(ctx:Context,data:*,x:Number,y:Number,fontStr:String,color:String,strokeColor:String,lineWidth:Number,textAlign:String,underLine:Number = null):void{}
		public function fillWords(ctx:Context,data:Array,x:Number,y:Number,fontStr:String,color:String,strokeColor:String,lineWidth:Number):void{}
		public function _fast_filltext(ctx:Context,data:*,htmlchars:Array,x:Number,y:Number,font:FontInfo,color:String,strokeColor:String,lineWidth:Number,textAlign:Number,underLine:Number = null):void{}
		protected function _drawResortedWords(ctx:Context,startx:Number,starty:Number,samePagesData:Array):void{}
		public function hasFreedText(txts:Array):Boolean{}
		public function getCharRenderInfo(str:String,font:FontInfo,color:String,strokeColor:String,lineWidth:Number,isoTexture:Boolean = null):CharRenderInfo{}
		public function addBmpData(data:ImageData,ri:CharRenderInfo):TextAtlas{}
		public function GC():void{}
		public function cleanAtlases():void{}
		public function getCharBmp(c:String):*{}
		private var checkBmpLine:*;
		private var updateBbx:*;
		public function getFontSizeInfo(font:String):Number{}
		public function printDbgInfo():void{}
		public function showAtlas(n:Number,bgcolor:String,x:Number,y:Number,w:Number,h:Number):Sprite{}
		public function filltext_native(ctx:Context,data:*,htmlchars:Array,x:Number,y:Number,fontStr:String,color:String,strokeColor:String,lineWidth:Number,textAlign:String,underLine:Number = null):void{}
	}

}
