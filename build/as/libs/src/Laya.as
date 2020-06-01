package  {
	import laya.display.Stage;
	import laya.net.LoaderManager;
	import laya.renders.Render;
	import laya.utils.Timer;

	/**
	 * <code>Laya</code> 是全局对象的引用入口集。
	 * Laya类引用了一些常用的全局对象，比如Laya.stage：舞台，Laya.timer：时间管理器，Laya.loader：加载管理器，使用时注意大小写。
	 */
	public class Laya {

		/**
		 * 舞台对象的引用。
		 */
		public static var stage:Stage;

		/**
		 * @private 系统时钟管理器，引擎内部使用
		 */
		public static var systemTimer:Timer;

		/**
		 * @private 组件的start时钟管理器
		 */
		public static var startTimer:Timer;

		/**
		 * @private 组件的物理时钟管理器
		 */
		public static var physicsTimer:Timer;

		/**
		 * @private 组件的update时钟管理器
		 */
		public static var updateTimer:Timer;

		/**
		 * @private 组件的lateUpdate时钟管理器
		 */
		public static var lateTimer:Timer;

		/**
		 * 游戏主时针，同时也是管理场景，动画，缓动等效果时钟，通过控制本时针缩放，达到快进慢播效果
		 */
		public static var timer:Timer;

		/**
		 * 加载管理器的引用。
		 */
		public static var loader:LoaderManager;

		/**
		 * 当前引擎版本。
		 */
		public static var version:String;

		/**
		 * @private Render 类的引用。
		 */
		public static var render:Render;

		/**
		 * 是否是微信小游戏子域，默认为false*
		 */
		public static var isWXOpenDataContext:Boolean;

		/**
		 * 微信小游戏是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false*
		 */
		public static var isWXPosMsg:Boolean;

		/**
		 * 兼容as3编译工具
		 */
		public static function __init(_classs:Array):void{}

		/**
		 * 初始化引擎。使用引擎需要先初始化引擎，否则可能会报错。
		 * @param width 初始化的游戏窗口宽度，又称设计宽度。
		 * @param height 初始化的游戏窗口高度，又称设计高度。
		 * @param plugins 插件列表，比如 WebGL（使用WebGL方式渲染）。
		 * @return 返回原生canvas引用，方便对canvas属性进行修改
		 */
		public static function init(width:Number,height:Number,...plugins):*{}

		/**
		 * 表示是否捕获全局错误并弹出提示。默认为false。
		 * 适用于移动设备等不方便调试的时候，设置为true后，如有未知错误，可以弹窗抛出详细错误堆栈。
		 */
		public static function alertGlobalError(value:Boolean):void{}

		/**
		 * 开启DebugPanel
		 * @param debugJsPath laya.debugtool.js文件路径
		 */
		public static function enableDebugPanel(debugJsPath:String = null):void{}
		private static var isNativeRender_enable:*;

		/**
		 * @private 
		 */
		private static var enableWebGLPlus:*;

		/**
		 * @private 
		 */
		private static var enableNative:*;
	}

}
