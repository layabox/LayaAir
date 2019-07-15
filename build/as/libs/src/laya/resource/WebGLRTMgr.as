/*[IF-FLASH]*/
package laya.resource {
	improt laya.resource.RenderTexture2D;
	public class WebGLRTMgr {
		private static var dict:*;
		public static function getRT(w:Number,h:Number):RenderTexture2D{}
		public static function releaseRT(rt:RenderTexture2D):void{}
	}

}
