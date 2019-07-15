/*[IF-FLASH]*/
package laya.renders {
	improt laya.resource.Context;
	improt laya.resource.HTMLCanvas;
	public class Render {
		public static var supportWebGLPlusCulling:Boolean;
		public static var supportWebGLPlusAnimation:Boolean;
		public static var supportWebGLPlusRendering:Boolean;
		public static var isConchApp:Boolean;
		public static var is3DMode:Boolean;

		public function Render(width:Number,height:Number,mainCanv:HTMLCanvas){}
		private var _timeId:*;
		private var _onVisibilitychange:*;
		public function initRender(canvas:HTMLCanvas,w:Number,h:Number):Boolean{}
		private var _enterFrame:*;
		public static function get context():Context{};
		public static function get canvas():*{};
	}

}
