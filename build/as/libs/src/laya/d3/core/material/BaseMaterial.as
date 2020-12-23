package laya.d3.core.material {
	import laya.utils.Handler;
	import laya.d3.shader.ShaderDefine;

	/**
	 * BaseMaterial has deprecated,please use Material instead废弃的类，请使用Material类.
	 * @deprecated 
	 */
	public class BaseMaterial {

		/**
		 * @deprecated 废弃请使用Material类 use Material.MATERIAL instead
		 */
		public static var MATERIAL:String;

		/**
		 * @deprecated 废弃请使用Material类 use Material.RENDERQUEUE_OPAQUE instead
		 */
		public static var RENDERQUEUE_OPAQUE:Number;

		/**
		 * @deprecated 废弃请使用Material类 use Material.RENDERQUEUE_ALPHATEST instead
		 */
		public static var RENDERQUEUE_ALPHATEST:Number;

		/**
		 * @deprecated 废弃请使用Material类 use Material.RENDERQUEUE_TRANSPARENT instead
		 */
		public static var RENDERQUEUE_TRANSPARENT:Number;

		/**
		 * @deprecated 废弃请使用Material类 use Material.ALPHATESTVALUE instead
		 */
		public static var ALPHATESTVALUE:Number;

		/**
		 * @deprecated 废弃请使用Material类 use Material.SHADERDEFINE_ALPHATEST instead
		 */
		public static var SHADERDEFINE_ALPHATEST:ShaderDefine;

		/**
		 * @deprecated 废弃请使用Material类 BaseMaterial has deprecated,please use Material instead.
		 * @param 资源路径 
		 * @param 处理句柄 
		 */
		public static function load(url:String,complete:Handler):void{}
	}

}
