package laya.device.media {
	import laya.resource.Bitmap;

	/**
	 * <HtmlVideo>html多媒体数据<HtmlVideo>
	 */
	public class HtmlVideo extends Bitmap {
		public var video:HTMLVideoElement;
		protected var _source:*;
		protected var _w:Number;
		protected var _h:Number;

		public function HtmlVideo(){}

		/**
		 * 创建一个 HtmlVideo 实例
		 */
		public static var create:Function;
		private var createDomElement:*;

		/**
		 * 设置播放源路径
		 * @param url 播放源路径
		 * @param extension 播放源类型(1: MP4, 2: OGG)
		 */
		public function setSource(url:String,extension:Number):void{}
		private var appendSource:*;

		/**
		 * 获取播放源
		 */
		public function getVideo():*{}

		/**
		 * 销毁
		 * @override 
		 */
		override public function destroy():void{}
	}

}
