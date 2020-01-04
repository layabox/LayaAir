package laya.renders {
	import laya.resource.Context;
	import laya.resource.RenderTexture2D;

	/**
	 * @private 精灵渲染器
	 */
	public class RenderSprite {

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */
		public static var INIT:Number;

		/**
		 * @private 
		 */
		public static var renders:Array;

		/**
		 * @private 
		 */
		protected static var NORENDER:RenderSprite;
		private static var _initRenderFun:*;
		private static var _getTypeRender:*;

		public function RenderSprite(type:Number = undefined,next:RenderSprite = undefined){}
		protected function onCreate(type:Number):void{}
		public static var tempUV:Array;
		public static function tmpTarget(ctx:Context,rt:RenderTexture2D,w:Number,h:Number):void{}
		public static function recycleTarget(rt:RenderTexture2D):void{}
		public static function setBlendMode(blendMode:String):void{}
	}

}
