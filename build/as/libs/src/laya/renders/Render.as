package laya.renders {
	import laya.resource.Context;
	import laya.resource.HTMLCanvas;

	/**
	 * <code>Render</code> 是渲染管理类。它是一个单例，可以使用 Laya.render 访问。
	 */
	public class Render {
		public static var supportWebGLPlusCulling:Boolean;
		public static var supportWebGLPlusAnimation:Boolean;
		public static var supportWebGLPlusRendering:Boolean;

		/**
		 * 是否是加速器 只读
		 */
		public static var isConchApp:Boolean;

		/**
		 * 表示是否是 3D 模式。
		 */
		public static var is3DMode:Boolean;

		/**
		 * 初始化引擎。
		 * @param width 游戏窗口宽度。
		 * @param height 游戏窗口高度。
		 */

		public function Render(width:Number = undefined,height:Number = undefined,mainCanv:HTMLCanvas = undefined){}

		/**
		 * @private 
		 */
		private var _timeId:*;

		/**
		 * @private 
		 */
		private var _onVisibilitychange:*;
		public function initRender(canvas:HTMLCanvas,w:Number,h:Number):Boolean{
			return null;
		}

		/**
		 * @private 
		 */
		private var _enterFrame:*;

		/**
		 * 目前使用的渲染器。
		 */
		public static function get context():Context{
				return null;
		}

		/**
		 * 渲染使用的原生画布引用。
		 */
		public static function get canvas():*{
				return null;
		}
	}

}
