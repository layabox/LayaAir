package laya.net {
	import laya.events.EventDispatcher;
	import laya.resource.Texture;
	import laya.net.HttpRequest;

	/**
	 * 加载进度发生改变时调度。
	 * @eventType Event.PROGRESS
	 */

	/**
	 * 加载完成后调度。
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 加载出错时调度。
	 * @eventType Event.ERROR
	 */

	/**
	 * <code>Loader</code> 类可用来加载文本、JSON、XML、二进制、图像等资源。
	 */
	public class Loader extends EventDispatcher {

		/**
		 * 文本类型，加载完成后返回文本。
		 */
		public static var TEXT:String;

		/**
		 * JSON 类型，加载完成后返回json数据。
		 */
		public static var JSON:String;

		/**
		 * prefab 类型，加载完成后返回Prefab实例。
		 */
		public static var PREFAB:String;

		/**
		 * XML 类型，加载完成后返回domXML。
		 */
		public static var XML:String;

		/**
		 * 二进制类型，加载完成后返回arraybuffer二进制数据。
		 */
		public static var BUFFER:String;

		/**
		 * 纹理类型，加载完成后返回Texture。
		 */
		public static var IMAGE:String;

		/**
		 * 声音类型，加载完成后返回sound。
		 */
		public static var SOUND:String;

		/**
		 * 图集类型，加载完成后返回图集json信息(并创建图集内小图Texture)。
		 */
		public static var ATLAS:String;

		/**
		 * 位图字体类型，加载完成后返回BitmapFont，加载后，会根据文件名自动注册为位图字体。
		 */
		public static var FONT:String;

		/**
		 * TTF字体类型，加载完成后返回null。
		 */
		public static var TTF:String;

		/**
		 * 预加载文件类型，加载完成后自动解析到preLoadedMap。
		 */
		public static var PLF:String;

		/**
		 * 二进制预加载文件类型，加载完成后自动解析到preLoadedMap。
		 */
		public static var PLFB:String;

		/**
		 * Hierarchy资源。
		 */
		public static var HIERARCHY:String;

		/**
		 * Mesh资源。
		 */
		public static var MESH:String;

		/**
		 * Material资源。
		 */
		public static var MATERIAL:String;

		/**
		 * Texture2D资源。
		 */
		public static var TEXTURE2D:String;

		/**
		 * TextureCube资源。
		 */
		public static var TEXTURECUBE:String;

		/**
		 * AnimationClip资源。
		 */
		public static var ANIMATIONCLIP:String;

		/**
		 * Avatar资源。
		 */
		public static var AVATAR:String;

		/**
		 * Terrain资源。
		 */
		public static var TERRAINHEIGHTDATA:String;

		/**
		 * Terrain资源。
		 */
		public static var TERRAINRES:String;

		/**
		 * 文件后缀和类型对应表。
		 */
		public static var typeMap:*;

		/**
		 * 资源解析函数对应表，用来扩展更多类型的资源加载解析。
		 */
		public static var parserMap:*;

		/**
		 * 每帧加载完成回调使用的最大超时时间，如果超时，则下帧再处理，防止帧卡顿。
		 */
		public static var maxTimeOut:Number;

		/**
		 * 资源分组对应表。
		 */
		public static var groupMap:*;

		/**
		 * 已加载的资源池。
		 */
		public static var loadedMap:*;

		/**
		 * 已加载的图集资源池。
		 */
		public static var atlasMap:*;

		/**
		 * 已加载的纹理资源池。
		 */
		public static var textureMap:*;

		/**
		 * @private 已加载的数据文件。
		 */
		public static var preLoadedMap:*;

		/**
		 * @private 引用image对象，防止垃圾回收
		 */
		protected static var _imgCache:*;

		/**
		 * @private 
		 */
		protected static var _loaders:Array;

		/**
		 * @private 
		 */
		protected static var _isWorking:Boolean;

		/**
		 * @private 
		 */
		protected static var _startIndex:Number;

		/**
		 * 获取指定资源地址的数据类型。
		 * @param url 资源地址。
		 * @return 数据类型。
		 */
		public static function getTypeFromUrl(url:String):String{
			return null;
		}

		/**
		 * @private 
		 */
		protected var _url:String;

		/**
		 * @private 
		 */
		protected var _type:String;

		/**
		 * @private 
		 */
		protected var _http:HttpRequest;

		/**
		 * @private 
		 */
		protected var _useWorkerLoader:Boolean;

		/**
		 * 加载资源。加载错误会派发 Event.ERROR 事件，参数为错误信息。
		 * @param url 资源地址。
		 * @param type (default = null)资源类型。可选值为：Loader.TEXT、Loader.JSON、Loader.XML、Loader.BUFFER、Loader.IMAGE、Loader.SOUND、Loader.ATLAS、Loader.FONT。如果为null，则根据文件后缀分析类型。
		 * @param cache (default = true)是否缓存数据。
		 * @param group (default = null)分组名称。
		 * @param ignoreCache (default = false)是否忽略缓存，强制重新加载。
		 * @param useWorkerLoader (default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
		 */
		public function load(url:String,type:String = null,cache:Boolean = null,group:String = null,ignoreCache:Boolean = null,useWorkerLoader:Boolean = null):void{}

		/**
		 * @private onload、onprocess、onerror必须写在本类
		 */
		private var _loadHttpRequest:*;

		/**
		 * @private 
		 */
		private var _loadHtmlImage:*;

		/**
		 * @private 加载TTF资源。
		 * @param url 资源地址。
		 */
		protected function _loadTTF(url:String):void{}

		/**
		 * @private 
		 */
		protected function _loadImage(url:String,isformatURL:Boolean = null):void{}

		/**
		 * @private 
		 */
		protected function onProgress(value:Number):void{}

		/**
		 * @private 
		 */
		protected function onError(message:String):void{}

		/**
		 * 资源加载完成的处理函数。
		 * @param data 数据。
		 */
		protected function onLoaded(data:* = null):void{}
		private var parsePLFData:*;
		private var parsePLFBData:*;
		private var parseOnePLFBFile:*;

		/**
		 * 加载完成。
		 * @param data 加载的数据。
		 */
		protected function complete(data:*):void{}

		/**
		 * @private 
		 */
		private static var checkNext:*;

		/**
		 * 结束加载，处理是否缓存及派发完成事件 <code>Event.COMPLETE</code> 。
		 * @param content 加载后的数据
		 */
		public function endLoad(content:* = null):void{}

		/**
		 * 加载地址。
		 */
		public function get url():String{
				return null;
		}

		/**
		 * 加载类型。
		 */
		public function get type():String{
				return null;
		}

		/**
		 * 是否缓存。
		 */
		public function get cache():Boolean{
				return null;
		}

		/**
		 * 返回的数据。
		 */
		public function get data():*{
				return null;
		}

		/**
		 * 清理指定资源地址的缓存。
		 * @param url 资源地址。
		 */
		public static function clearRes(url:String):void{}

		/**
		 * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
		 * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
		 * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误，clearRes则采用引用计数方式销毁
		 * 【注意】如果图片本身在自动合集里面（默认图片小于512*512），内存是不能被销毁的，此图片被大图合集管理器管理
		 * @param url 图集地址或者texture地址，比如 Loader.clearTextureRes("res/atlas/comp.atlas"); Loader.clearTextureRes("hall/bg.jpg");
		 */
		public static function clearTextureRes(url:String):void{}

		/**
		 * 获取指定资源地址的资源或纹理。
		 * @param url 资源地址。
		 * @return 返回资源。
		 */
		public static function getRes(url:String):*{}

		/**
		 * 获取指定资源地址的图集地址列表。
		 * @param url 图集地址。
		 * @return 返回地址集合。
		 */
		public static function getAtlas(url:String):Array{
			return null;
		}

		/**
		 * 缓存资源。
		 * @param url 资源地址。
		 * @param data 要缓存的内容。
		 */
		public static function cacheRes(url:String,data:*):void{}

		/**
		 * 缓存Teture。
		 * @param url 资源地址。
		 * @param data 要缓存的Texture。
		 */
		public static function cacheTexture(url:String,data:Texture):void{}

		/**
		 * 设置资源分组。
		 * @param url 资源地址。
		 * @param group 分组名。
		 */
		public static function setGroup(url:String,group:String):void{}

		/**
		 * 根据分组清理资源。
		 * @param group 分组名。
		 */
		public static function clearResByGroup(group:String):void{}
	}

}
