/*[IF-FLASH]*/
package laya.filters {
	improt laya.filters.Filter;
	public class BlurFilter extends laya.filters.Filter {
		public var strength:Number;
		public var strength_sig2_2sig2_gauss1:Array;
		public var strength_sig2_native:Float32Array;
		public var renderFunc:*;

		public function BlurFilter(strength:Number = null){}
		public function get type():Number{};
		public function getStrenth_sig2_2sig2_native():Float32Array{}
	}

}
