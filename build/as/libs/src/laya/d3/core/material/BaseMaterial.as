package laya.d3.core.material {
	import laya.utils.Handler;
	import laya.d3.shader.ShaderDefine;

	/**
	 * BaseMaterial has deprecated,please use Material instead.
	 * @deprecated 
	 */
	public class BaseMaterial {

		/**
		 * @deprecated use Material.MATERIAL instead
		 */
		public static var MATERIAL:String;

		/**
		 * @deprecated use Material.RENDERQUEUE_OPAQUE instead
		 */
		public static var RENDERQUEUE_OPAQUE:Number;

		/**
		 * @deprecated use Material.RENDERQUEUE_ALPHATEST instead
		 */
		public static var RENDERQUEUE_ALPHATEST:Number;

		/**
		 * @deprecated use Material.RENDERQUEUE_TRANSPARENT instead
		 */
		public static var RENDERQUEUE_TRANSPARENT:Number;

		/**
		 * @deprecated use Material.ALPHATESTVALUE instead
		 */
		public static var ALPHATESTVALUE:Number;

		/**
		 * @deprecated use Material.SHADERDEFINE_ALPHATEST instead
		 */
		public static var SHADERDEFINE_ALPHATEST:ShaderDefine;

		/**
		 * @deprecated BaseMaterial has deprecated,please use Material instead.
		 */
		public static function load(url:String,complete:Handler):void{}
	}

}
