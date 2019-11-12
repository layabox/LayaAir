package laya.webgl.text {
	import laya.webgl.text.TextAtlas;
	import laya.display.Sprite;
	import laya.resource.Context;
	import laya.utils.FontInfo;
	import laya.utils.HTMLChar;
	import laya.utils.WordText;
	import laya.webgl.text.CharRenderInfo;
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

		/**
		 * fontSizeInfo
		 * 记录每种字体的像素的大小。标准是32px的字体。由4个byte组成，分别表示[xdist,ydist,w,h]。
		 * xdist,ydist 是像素起点到排版原点的距离，都是正的，表示实际数据往左和上偏多少，如果实际往右和下偏，则算作0，毕竟这个只是一个大概
		 * 例如 [Arial]=0x00002020, 表示宽高都是32
		 */
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

		/**
		 * 设置当前字体，获得字体的大小信息。
		 * @param font 
		 */
		public function setFont(font:FontInfo):void{}

		/**
		 * 从string中取出一个完整的char，例如emoji的话要多个
		 * 会修改 _curStrPos
		 * TODO 由于各种文字中的组合写法，这个需要能扩展，以便支持泰文等
		 * @param str 
		 * @param start 开始位置
		 */
		public function getNextChar(str:String):String{
			return null;
		}
		public function filltext(ctx:Context,data:*,x:Number,y:Number,fontStr:String,color:String,strokeColor:String,lineWidth:Number,textAlign:String,underLine:Number = null):void{}
		public function fillWords(ctx:Context,data:Array,x:Number,y:Number,fontStr:*,color:String,strokeColor:String,lineWidth:Number):void{}
		public function _fast_filltext(ctx:Context,data:*,htmlchars:Array,x:Number,y:Number,font:FontInfo,color:String,strokeColor:String,lineWidth:Number,textAlign:Number,underLine:Number = null):void{}

		/**
		 * 画出重新按照贴图顺序分组的文字。
		 * @param samePagesData 
		 * @param startx 保存的数据是相对位置，所以需要加上这个偏移。用相对位置更灵活一些。
		 * @param y 因为这个只能画在一行上所以没有必要保存y。所以这里再把y传进来
		 */
		protected function _drawResortedWords(ctx:Context,startx:Number,starty:Number,samePagesData:Array):void{}

		/**
		 * 检查 txts数组中有没有被释放的资源
		 * @param txts 
		 * @param startid 
		 * @return 
		 */
		public function hasFreedText(txts:Array):Boolean{
			return null;
		}
		public function getCharRenderInfo(str:String,font:FontInfo,color:String,strokeColor:String,lineWidth:Number,isoTexture:Boolean = null):CharRenderInfo{
			return null;
		}

		/**
		 * 添加数据到大图集
		 * @param w 
		 * @param h 
		 * @return 
		 */
		public function addBmpData(data:ImageData,ri:CharRenderInfo):TextAtlas{
			return null;
		}

		/**
		 * 清理利用率低的大图集
		 */
		public function GC():void{}

		/**
		 * 尝试清理大图集
		 */
		public function cleanAtlases():void{}
		public function getCharBmp(c:String):*{}

		/**
		 * 检查当前线是否存在数据
		 * @param data 
		 * @param l 
		 * @param sx 
		 * @param ex 
		 * @return 
		 */
		private var checkBmpLine:*;

		/**
		 * 根据bmp数据和当前的包围盒，更新包围盒
		 * 由于选择的文字是连续的，所以可以用二分法
		 * @param data 
		 * @param curbbx [l,t,r,b]
		 * @param onlyH 不检查左右
		 */
		private var updateBbx:*;
		public function getFontSizeInfo(font:String):Number{
			return null;
		}
		public function printDbgInfo():void{}
		public function showAtlas(n:Number,bgcolor:String,x:Number,y:Number,w:Number,h:Number):Sprite{
			return null;
		}
		public function filltext_native(ctx:Context,data:*,htmlchars:Array,x:Number,y:Number,fontStr:String,color:String,strokeColor:String,lineWidth:Number,textAlign:String,underLine:Number = null):void{}
	}

}
