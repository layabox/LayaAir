package laya.resource {
	import laya.resource.BaseTexture;

	/**
	 * <code>VideoTexture</code> 多媒体纹理
	 */
	public class VideoTexture extends BaseTexture {

		/**
		 * videoTexture对象池
		 */
		public static var _videoTexturePool:Array;
		private var _video:*;
		private var _needUpdate:*;

		/**
		 * 创建VideoTexture对象，
		 */

		public function VideoTexture(){}

		/**
		 * 获得绑定的资源Video
		 * return HTMLVideoElement
		 */
		public function get video():*{return null;}

		/**
		 * @value 输入Video资源
		 */
		public function set video(value:*):void{}

		/**
		 * 开始播放视频
		 */
		public function videoPlay():void{}

		/**
		 * 暂停播放视频
		 */
		public function videoPause():void{}
		public function destroy():void{}
	}

}
