/*[IF-FLASH]*/
package laya.filters {
	improt laya.filters.IFilter;
	public class Filter implements laya.filters.IFilter {
		public static var BLUR:Number;
		public static var COLOR:Number;
		public static var GLOW:Number;

		public function Filter(){}
		public function get type():Number{};
		public static var _filter:Function;
	}

}
