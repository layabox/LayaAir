package laya.display {
	import laya.resource.Texture;
	import laya.utils.Handler;

	/**
	 * <code>BitmapFont</code> 是位图字体类，用于定义位图字体信息。
	 * 字体制作及使用方法，请参考文章
	 * @see http://ldc2.layabox.com/doc/?nav=ch-js-1-2-5
	 */
	public class BitmapFont {
		private var _texture:*;
		private var _fontCharDic:*;
		private var _fontWidthMap:*;
		private var _complete:*;
		private var _path:*;
		private var _maxWidth:*;
		private var _spaceWidth:*;
		private var _padding:*;

		/**
		 * 当前位图字体字号，使用时，如果字号和设置不同，并且autoScaleSize=true，则按照设置字号比率进行缩放显示。
		 */
		public var fontSize:Number;

		/**
		 * 表示是否根据实际使用的字体大小缩放位图字体大小。
		 */
		public var autoScaleSize:Boolean;

		/**
		 * 字符间距（以像素为单位）。
		 */
		public var letterSpacing:Number;

		/**
		 * 通过指定位图字体文件路径，加载位图字体文件，加载完成后会自动解析。
		 * @param path 位图字体文件的路径。
		 * @param complete 加载并解析完成的回调。
		 */
		public function loadFont(path:String,complete:Handler):void{}

		/**
		 * @private 
		 */
		private var _onLoaded:*;

		/**
		 * 解析字体文件。
		 * @param xml 字体文件XML。
		 * @param texture 字体的纹理。
		 */
		public function parseFont(xml:XmlDom,texture:Texture):void{}

		/**
		 * 解析字体文件。
		 * @param xml 字体文件XML。
		 * @param texture 字体的纹理。
		 */
		public function parseFont2(xml:XmlDom,texture:Texture):void{}

		/**
		 * 获取指定字符的字体纹理对象。
		 * @param char 字符。
		 * @return 指定的字体纹理对象。
		 */
		public function getCharTexture(char:String):Texture{
			return null;
		}

		/**
		 * 销毁位图字体，调用Text.unregisterBitmapFont 时，默认会销毁。
		 */
		public function destroy():void{}

		/**
		 * 设置空格的宽（如果字体库有空格，这里就可以不用设置了）。
		 * @param spaceWidth 宽度，单位为像素。
		 */
		public function setSpaceWidth(spaceWidth:Number):void{}

		/**
		 * 获取指定字符的宽度。
		 * @param char 字符。
		 * @return 宽度。
		 */
		public function getCharWidth(char:String):Number{
			return null;
		}

		/**
		 * 获取指定文本内容的宽度。
		 * @param text 文本内容。
		 * @return 宽度。
		 */
		public function getTextWidth(text:String):Number{
			return null;
		}

		/**
		 * 获取最大字符宽度。
		 */
		public function getMaxWidth():Number{
			return null;
		}

		/**
		 * 获取最大字符高度。
		 */
		public function getMaxHeight():Number{
			return null;
		}
	}

}
