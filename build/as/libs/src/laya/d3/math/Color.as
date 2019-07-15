/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.core.IClone;
	public class Color implements laya.d3.core.IClone {
		public static var RED:Color;
		public static var GREEN:Color;
		public static var BLUE:Color;
		public static var CYAN:Color;
		public static var YELLOW:Color;
		public static var MAGENTA:Color;
		public static var GRAY:Color;
		public static var WHITE:Color;
		public static var BLACK:Color;
		public static function gammaToLinearSpace(value:Number):Number{}
		public static function linearToGammaSpace(value:Number):Number{}
		public var r:Number;
		public var g:Number;
		public var b:Number;
		public var a:Number;

		public function Color(r:Number = null,g:Number = null,b:Number = null,a:Number = null){}
		public function toLinear(out:Color):void{}
		public function toGamma(out:Color):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function forNativeElement():void{}
	}

}
