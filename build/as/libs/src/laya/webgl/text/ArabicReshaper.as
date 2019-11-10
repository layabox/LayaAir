package laya.webgl.text {

	/**
	 * 阿拉伯文的转码。把unicode的阿拉伯文字母编码转成他们的老的能描述不同写法的编码。
	 *   这个是从GitHub上 Javascript-Arabic-Reshaper 项目转来的
	 * https://github.com/louy/Javascript-Arabic-Reshaper/blob/master/src/index.js
	 */

	/**
	 * Javascript Arabic Reshaper by Louy Alakkad
	 * https://github.com/louy/Javascript-Arabic-Reshaper
	 * Based on (http://git.io/vsnAd)
	 */
	public class ArabicReshaper {
		private static var charsMap:*;
		private static var combCharsMap:*;
		private static var transChars:*;
		public function characterMapContains(c:Number):Boolean{
			return null;
		}
		public function getCharRep(c:Number):Boolean{
			return null;
		}
		public function getCombCharRep(c1:*,c2:*):Boolean{
			return null;
		}
		public function isTransparent(c:*):Boolean{
			return null;
		}
		public function getOriginalCharsFromCode(code:*):String{
			return null;
		}

		/**
		 * 转换函数。从normal转到presentB
		 * 这个返回的字符串可以直接按照从左到右的顺序渲染。
		 * 例如
		 * graphics.fillText(convertArabic('سلام'),....)
		 */
		public function convertArabic(normal:*):String{
			return null;
		}
		public function convertArabicBack(apfb:*):String{
			return null;
		}
	}

}
