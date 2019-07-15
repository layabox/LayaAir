/*[IF-FLASH]*/
package laya.webgl.text {
	public class ArabicReshaper {
		private static var charsMap:*;
		private static var combCharsMap:*;
		private static var transChars:*;
		public function characterMapContains(c:Number):Boolean{}
		public function getCharRep(c:Number):Boolean{}
		public function getCombCharRep(c1:*,c2:*):Boolean{}
		public function isTransparent(c:*):Boolean{}
		public function getOriginalCharsFromCode(code:*):String{}
		public function convertArabic(normal:*):String{}
		public function convertArabicBack(apfb:*):String{}
	}

}
