package laya.filters {
	import laya.filters.Filter;

	/**
	 * 模糊滤镜
	 */
	public class BlurFilter extends Filter {

		/**
		 * 模糊滤镜的强度(值越大，越不清晰
		 */
		public var strength:Number;
		public var strength_sig2_2sig2_gauss1:Array;
		public var strength_sig2_native:Float32Array;
		public var renderFunc:*;

		/**
		 * 模糊滤镜
		 * @param strength 模糊滤镜的强度值
		 */

		public function BlurFilter(strength:Number = undefined){}

		/**
		 * @private 当前滤镜的类型
		 * @override 
		 */
		override public function get type():Number{return null;}
		public function getStrenth_sig2_2sig2_native():Float32Array{
			return null;
		}
	}

}
