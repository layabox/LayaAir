package laya.resource {
	import laya.resource.RenderTexture2D;

	/**
	 * WebGLRTMgr 管理WebGLRenderTarget的创建和回收
	 * TODO 需求不大，管理成本高。先去掉。
	 */
	public class WebGLRTMgr {
		private static var dict:*;

		/**
		 * 获得一个renderTarget
		 * 暂时先按照严格大小判断。
		 * @param w 
		 * @param h 
		 * @return 
		 */
		public static function getRT(w:Number,h:Number):RenderTexture2D{
			return null;
		}

		/**
		 * 回收一个renderTarget
		 * @param rt 
		 */
		public static function releaseRT(rt:RenderTexture2D):void{}
	}

}
