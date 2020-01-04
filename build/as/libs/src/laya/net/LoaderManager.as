package laya.net {
	import laya.events.EventDispatcher;
	import laya.utils.Handler;

	/**
	 * 所有资源加载完成时调度。
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 任何资源加载出错时调度。
	 * @eventType Event.ERROR
	 */

	/**
	 * <p> <code>LoaderManager</code> 类用于用于批量加载资源。此类是单例，不要手动实例化此类，请通过Laya.loader访问。</p>
	 * <p>全部队列加载完成，会派发 Event.COMPLETE 事件；如果队列中任意一个加载失败，会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
	 * <p> <code>LoaderManager</code> 类提供了以下几种功能：<br/>
	 * 多线程：默认5个加载线程，可以通过maxLoader属性修改线程数量；<br/>
	 * 多优先级：有0-4共5个优先级，优先级高的优先加载。0最高，4最低；<br/>
	 * 重复过滤：自动过滤重复加载（不会有多个相同地址的资源同时加载）以及复用缓存资源，防止重复加载；<br/>
	 * 错误重试：资源加载失败后，会重试加载（以最低优先级插入加载队列），retryNum设定加载失败后重试次数，retryDelay设定加载重试的时间间隔。</p>
	 * @see laya.net.Loader
	 */
	public class LoaderManager extends EventDispatcher {

		/**
		 * @private 
		 */
		private static var _resMap:*;

		/**
		 * @private 
		 */
		public static var createMap:*;

		/**
		 * 加载出错后的重试次数，默认重试一次
		 */
		public var retryNum:Number;

		/**
		 * 延迟时间多久再进行错误重试，默认立即重试
		 */
		public var retryDelay:Number;

		/**
		 * 最大下载线程，默认为5个
		 */
		public var maxLoader:Number;

		/**
		 * @private 
		 */
		private var _loaders:*;

		/**
		 * @private 
		 */
		private var _loaderCount:*;

		/**
		 * @private 
		 */
		private var _resInfos:*;

		/**
		 * @private 
		 */
		private var _infoPool:*;

		/**
		 * @private 
		 */
		private var _maxPriority:*;

		/**
		 * @private 
		 */
		private var _failRes:*;

		/**
		 * @private 
		 */
		private var _statInfo:*;

		/**
		 * @private 
		 */
		public function getProgress():Number{
			return null;
		}

		/**
		 * @private 
		 */
		public function resetProgress():void{}

		/**
		 * <p>创建一个新的 <code>LoaderManager</code> 实例。</p>
		 * <p><b>注意：</b>请使用Laya.loader加载资源，这是一个单例，不要手动实例化此类，否则会导致不可预料的问题。</p>
		 */

		public function LoaderManager(){}

		/**
		 * <p>根据clas类型创建一个未初始化资源的对象，随后进行异步加载，资源加载完成后，初始化对象的资源，并通过此对象派发 Event.LOADED 事件，事件回调参数值为此对象本身。套嵌资源的子资源会保留资源路径"?"后的部分。</p>
		 * <p>如果url为数组，返回true；否则返回指定的资源类对象，可以通过侦听此对象的 Event.LOADED 事件来判断资源是否已经加载完毕。</p>
		 * <p><b>注意：</b>cache参数只能对文件后缀为atlas的资源进行缓存控制，其他资源会忽略缓存，强制重新加载。</p>
		 * @param url 资源地址或者数组。如果url和clas同时指定了资源类型，优先使用url指定的资源类型。参数形如：[{url:xx,clas:xx,priority:xx,params:xx},{url:xx,clas:xx,priority:xx,params:xx}]。
		 * @param complete 加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
		 * @param progress 资源加载进度回调，回调参数值为当前资源加载的进度信息(0-1)。
		 * @param type 资源类型。
		 * @param constructParams 资源构造函数参数。
		 * @param propertyParams 资源属性参数。
		 * @param priority (default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
		 * @param cache 是否缓存加载的资源。
		 * @return 如果url为数组，返回true；否则返回指定的资源类对象。
		 */
		public function create(url:*,complete:Handler = null,progress:Handler = null,type:String = null,constructParams:Array = null,propertyParams:* = null,priority:Number = null,cache:Boolean = null):void{}

		/**
		 * @private 
		 */
		private var _createOne:*;

		/**
		 * <p>加载资源。资源加载错误时，本对象会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
		 * <p>因为返回值为 LoaderManager 对象本身，所以可以使用如下语法：loaderManager.load(...).load(...);</p>
		 * @param url 要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]。
		 * @param complete 加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
		 * @param progress 加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
		 * @param type 资源类型。比如：Loader.IMAGE。
		 * @param priority (default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
		 * @param cache 是否缓存加载结果。
		 * @param group 分组，方便对资源进行管理。
		 * @param ignoreCache 是否忽略缓存，强制重新加载。
		 * @param useWorkerLoader (default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
		 * @return 此 LoaderManager 对象本身。
		 */
		public function load(url:*,complete:Handler = null,progress:Handler = null,type:String = null,priority:Number = null,cache:Boolean = null,group:String = null,ignoreCache:Boolean = null,useWorkerLoader:Boolean = null):LoaderManager{
			return null;
		}
		private var _resInfoLoaded:*;
		private var _next:*;
		private var _doLoad:*;
		private var _endLoad:*;
		private var _addReTry:*;

		/**
		 * 清理指定资源地址缓存。
		 * @param url 资源地址。
		 */
		public function clearRes(url:String):void{}

		/**
		 * 销毁Texture使用的图片资源，保留texture壳，如果下次渲染的时候，发现texture使用的图片资源不存在，则会自动恢复
		 * 相比clearRes，clearTextureRes只是清理texture里面使用的图片资源，并不销毁texture，再次使用到的时候会自动恢复图片资源
		 * 而clearRes会彻底销毁texture，导致不能再使用；clearTextureRes能确保立即销毁图片资源，并且不用担心销毁错误，clearRes则采用引用计数方式销毁
		 * 【注意】如果图片本身在自动合集里面（默认图片小于512*512），内存是不能被销毁的，此图片被大图合集管理器管理
		 * @param url 图集地址或者texture地址，比如 Loader.clearTextureRes("res/atlas/comp.atlas"); Loader.clearTextureRes("hall/bg.jpg");
		 */
		public function clearTextureRes(url:String):void{}

		/**
		 * 获取指定资源地址的资源。
		 * @param url 资源地址。
		 * @return 返回资源。
		 */
		public function getRes(url:String):*{}

		/**
		 * 缓存资源。
		 * @param url 资源地址。
		 * @param data 要缓存的内容。
		 */
		public function cacheRes(url:String,data:*):void{}

		/**
		 * 设置资源分组。
		 * @param url 资源地址。
		 * @param group 分组名
		 */
		public function setGroup(url:String,group:String):void{}

		/**
		 * 根据分组清理资源。
		 * @param group 分组名
		 */
		public function clearResByGroup(group:String):void{}

		/**
		 * @private 缓存资源。
		 * @param url 资源地址。
		 * @param data 要缓存的内容。
		 */
		public static function cacheRes(url:String,data:*):void{}

		/**
		 * 清理当前未完成的加载，所有未加载的内容全部停止加载。
		 */
		public function clearUnLoaded():void{}

		/**
		 * 根据地址集合清理掉未加载的内容
		 * @param urls 资源地址集合
		 */
		public function cancelLoadByUrls(urls:Array):void{}

		/**
		 * 根据地址清理掉未加载的内容
		 * @param url 资源地址
		 */
		public function cancelLoadByUrl(url:String):void{}

		/**
		 * @private 加载数组里面的资源。
		 * @param arr 简单：["a.png","b.png"]，复杂[{url:"a.png",type:Loader.IMAGE,size:100,priority:1,useWorkerLoader:true},{url:"b.json",type:Loader.JSON,size:50,priority:1}]
		 */
		private var _loadAssets:*;

		/**
		 * 解码Texture或者图集
		 * @param urls texture地址或者图集地址集合
		 */
		public function decodeBitmaps(urls:Array):void{}
		private var _decodeTexture:*;
	}

}
