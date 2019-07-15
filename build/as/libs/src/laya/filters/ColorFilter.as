/*[IF-FLASH]*/
package laya.filters {
	improt laya.filters.Filter;
	improt laya.filters.IFilter;
	public class ColorFilter extends laya.filters.Filter implements laya.filters.IFilter {
		private static var DELTA_INDEX:*;
		private static var GRAY_MATRIX:*;
		private static var IDENTITY_MATRIX:*;
		private static var LENGTH:*;
		private var _matrix:*;

		public function ColorFilter(mat:Array = null){}
		public function gray():ColorFilter{}
		public function color(red:Number = null,green:Number = null,blue:Number = null,alpha:Number = null):ColorFilter{}
		public function setColor(color:String):ColorFilter{}
		public function setByMatrix(matrix:Array):ColorFilter{}
		public function get type():Number{};
		public function adjustColor(brightness:Number,contrast:Number,saturation:Number,hue:Number):ColorFilter{}
		public function adjustBrightness(brightness:Number):ColorFilter{}
		public function adjustContrast(contrast:Number):ColorFilter{}
		public function adjustSaturation(saturation:Number):ColorFilter{}
		public function adjustHue(hue:Number):ColorFilter{}
		public function reset():ColorFilter{}
		private var _multiplyMatrix:*;
		private var _clampValue:*;
		private var _fixMatrix:*;
		private var _copyMatrix:*;
	}

}
