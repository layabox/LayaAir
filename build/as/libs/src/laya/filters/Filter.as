package laya.filters {
	import laya.filters.IFilter;
	import laya.display.Sprite;
	import laya.resource.Context;

	/**
	 * <code>Filter</code> 是滤镜基类。
	 */
	public class Filter implements IFilter {

		/**
		 * @private 模糊滤镜。
		 */
		public static var BLUR:Number;

		/**
		 * @private 颜色滤镜。
		 */
		public static var COLOR:Number;

		/**
		 * @private 发光滤镜。
		 */
		public static var GLOW:Number;

		/**
		 * 创建一个 <code>Filter</code> 实例。
		 */

		public function Filter(){}

		/**
		 * @private 滤镜类型。
		 */
		public function get type():Number{
				return null;
		}
		public static var _filter:Function;
	}

}
