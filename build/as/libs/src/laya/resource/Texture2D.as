package laya.resource {
	import laya.utils.Handler;
	import laya.resource.BaseTexture;
	import laya.resource.TextureFormat;

	/**
	 * <code>Texture2D</code> 类用于生成2D纹理。
	 */
	public class Texture2D extends BaseTexture {

		/**
		 * Texture2D资源。
		 */
		public static var TEXTURE2D:String;

		/**
		 * 纯灰色纹理。
		 */
		public static var grayTexture:Texture2D;

		/**
		 * 纯白色纹理。
		 */
		public static var whiteTexture:Texture2D;

		/**
		 * 纯黑色纹理。
		 */
		public static var blackTexture:Texture2D;

		/**
		 * 加载Texture2D。
		 * @param url Texture2D地址。
		 * @param complete 完成回掉。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * 创建一个 <code>Texture2D</code> 实例。
		 * @param width 宽。
		 * @param height 高。
		 * @param format 贴图格式。
		 * @param mipmap 是否生成mipmap。
		 * @param canRead 是否可读像素,如果为true,会在内存保留像素数据。
		 */

		public function Texture2D(width:Number = undefined,height:Number = undefined,format:int = undefined,mipmap:Boolean = undefined,canRead:Boolean = undefined){}

		/**
		 * 通过图片源填充纹理,可为HTMLImageElement、HTMLCanvasElement、HTMLVideoElement、ImageBitmap、ImageData,
		 * 设置之后纹理宽高可能会发生变化。
		 */
		public function loadImageSource(source:*,premultiplyAlpha:Boolean = null):void{}

		/**
		 * 通过像素填充纹理。
		 * @param pixels 像素。
		 * @param miplevel 层级。
		 */
		public function setPixels(pixels:*,miplevel:Number = null):void{}

		/**
		 * 通过像素填充部分纹理。
		 * @param x X轴像素起点。
		 * @param y Y轴像素起点。
		 * @param width 像素宽度。
		 * @param height 像素高度。
		 * @param pixels 像素数组。
		 * @param miplevel 层级。
		 */
		public function setSubPixels(x:Number,y:Number,width:Number,height:Number,pixels:*,miplevel:Number = null):void{}

		/**
		 * 通过压缩数据填充纹理。
		 * @param data 压缩数据。
		 * @param miplevel 层级。
		 */
		public function setCompressData(data:ArrayBuffer):void{}

		/**
		 * 返回图片像素。
		 * @return 图片像素。
		 */
		public function getPixels():*{}
	}

}
