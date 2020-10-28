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
		public static var create:Function;
		private var createDomElement:*;
		public function setSource(url:String,extension:Number):void{}
		private var appendSource:*;
		public function getVideo():*{}

		/**
		 * @override 
		 */
		override public function destroy():void{}
	}

}
