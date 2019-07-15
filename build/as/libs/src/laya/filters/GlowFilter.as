/*[IF-FLASH]*/
package laya.filters {
	improt laya.filters.Filter;
	public class GlowFilter extends laya.filters.Filter {
		private var _elements:*;
		private var _color:*;

		public function GlowFilter(color:String,blur:Number = null,offX:Number = null,offY:Number = null){}
		public function get type():Number{};
		public var offY:Number;
		public var offX:Number;
		public function getColor():Array{}
		public var blur:Number;
		public function getColorNative():Float32Array{}
		public function getBlurInfo1Native():Float32Array{}
		public function getBlurInfo2Native():Float32Array{}
	}

}
