package laya.display {
	import laya.display.Sprite;
	import laya.utils.Handler;
	import laya.utils.Timer;

	/**
	 * 场景类，负责场景创建，加载，销毁等功能
	 * 场景被从节点移除后，并不会被自动垃圾机制回收，如果想回收，请调用destroy接口，可以通过unDestroyedScenes属性查看还未被销毁的场景列表
	 */
	public class Scene extends Sprite {

		/**
		 * 创建后，还未被销毁的场景列表，方便查看还未被销毁的场景列表，方便内存管理，本属性只读，请不要直接修改
		 */
		public static var unDestroyedScenes:Array;

		/**
		 * 获取根节点
		 */
		private static var _root:*;

		/**
		 * @private 
		 */
		private static var _loadPage:*;

		/**
		 * 场景被关闭后，是否自动销毁（销毁节点和使用到的资源），默认为false
		 */
		public var autoDestroyAtClosed:Boolean;

		/**
		 * 场景地址
		 */
		public var url:String;

		/**
		 * 场景时钟
		 */
		private var _timer:*;

		/**
		 * @private 
		 */
		private var _viewCreated:*;

		public function Scene(createChildren:Boolean = undefined){}

		/**
		 * @private 兼容老项目
		 */
		protected function createChildren():void{}

		/**
		 * 加载模式设置uimap
		 * @param url uimapJosn的url
		 */
		public static function setUIMap(url:*):void{}

		/**
		 * @private 兼容老项目装载场景视图。用于加载模式。
		 * @param path 场景地址。
		 */
		public function loadScene(path:String):void{}
		private var _onSceneLoaded:*;

		/**
		 * @private 兼容老项目通过视图数据创建视图。
		 * @param uiView 视图数据信息。
		 */
		public function createView(view:*):void{}

		/**
		 * 根据IDE内的节点id，获得节点实例
		 */
		public function getNodeByID(id:Number):*{}

		/**
		 * 打开场景。【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 * @param closeOther 是否关闭其他场景，默认为true（可选）
		 * @param param 打开页面的参数，会传递给onOpened方法（可选）
		 */
		public function open(closeOther:Boolean = null,param:* = null):void{}

		/**
		 * 场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）
		 */
		public function onOpened(param:*):void{}

		/**
		 * 关闭场景
		 * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 * @param type 关闭的原因，会传递给onClosed函数
		 */
		public function close(type:String = null):void{}

		/**
		 * 关闭完成后，调用此方法（如果有关闭动画，则在动画完成后执行）
		 * @param type 如果是点击默认关闭按钮触发，则传入关闭按钮的名字(name)，否则为null。
		 */
		public function onClosed(type:String = null):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @private 
		 */
		protected function _sizeChanged():void{}

		/**
		 * 获取场景根容器
		 */
		public static function get root():Sprite{
				return null;
		}

		/**
		 * 加载场景及场景使用到的资源
		 * @param url 场景地址
		 * @param complete 加载完成回调，返回场景实例（可选）
		 * @param progress 加载进度回调（可选）
		 */
		public static function load(url:String,complete:Handler = null,progress:Handler = null):void{}

		/**
		 * 加载并打开场景
		 * @param url 场景地址
		 * @param closeOther 是否关闭其他场景，默认为true（可选），【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 * @param param 打开页面的参数，会传递给onOpened方法（可选）
		 * @param complete 打开完成回调，返回场景实例（可选）
		 * @param progress 加载进度回调（可选）
		 */
		public static function open(url:String,closeOther:Boolean = null,param:* = null,complete:Handler = null,progress:Handler = null):void{}

		/**
		 * @private 
		 */
		private static var _onSceneLoaded:*;

		/**
		 * 根据地址，关闭场景（包括对话框）
		 * @param url 场景地址
		 * @param name 如果name不为空，name必须相同才能关闭
		 * @return 返回是否关闭成功，如果url找不到，则不成功
		 */
		public static function close(url:String,name:String = null):Boolean{
			return null;
		}

		/**
		 * 关闭所有场景，不包括对话框，如果关闭对话框，请使用Dialog.closeAll()
		 * 【注意】被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
		 */
		public static function closeAll():void{}

		/**
		 * 根据地址，销毁场景（包括对话框）
		 * @param url 场景地址
		 * @param name 如果name不为空，name必须相同才能关闭
		 * @return 返回是否销毁成功，如果url找不到，则不成功
		 */
		public static function destroy(url:String,name:String = null):Boolean{
			return null;
		}

		/**
		 * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
		 */
		public static function gc():void{}

		/**
		 * 设置loading界面，引擎会在调用open方法后，延迟打开loading界面，在页面添加到舞台之后，关闭loading界面
		 * @param loadPage load界面实例
		 */
		public static function setLoadingPage(loadPage:Scene):void{}

		/**
		 * 显示loading界面
		 * @param param 打开参数，如果是scene，则会传递给onOpened方法
		 * @param delay 延迟打开时间，默认500毫秒
		 */
		public static function showLoadingPage(param:* = null,delay:Number = null):void{}
		private static var _showLoading:*;
		private static var _hideLoading:*;

		/**
		 * 隐藏loading界面
		 * @param delay 延迟关闭时间，默认500毫秒
		 */
		public static function hideLoadingPage(delay:Number = null):void{}
	}

}
