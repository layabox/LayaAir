/*[IF-FLASH]*/
package laya.renders {
	improt laya.resource.Context;
	improt laya.resource.RenderTexture2D;
	public class RenderSprite {
		public static var renders:Array;
		protected static var NORENDER:RenderSprite;
		private static var _initRenderFun:*;
		private static var _getTypeRender:*;

		public function RenderSprite(type:Number,next:RenderSprite){}
		protected function onCreate(type:Number):void{}
		public static var tempUV:Array;
		public static function tmpTarget(ctx:Context,rt:RenderTexture2D,w:Number,h:Number):void{}
		public static function recycleTarget(rt:RenderTexture2D):void{}
		public static function setBlendMode(blendMode:String):void{}
	}

}
