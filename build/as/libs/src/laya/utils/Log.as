package laya.utils {

	/**
	 * <code>Log</code> 类用于在界面内显示日志记录信息。
	 * 注意：在加速器内不可使用
	 */
	public class Log {

		/**
		 * @private 
		 */
		private static var _logdiv:*;

		/**
		 * @private 
		 */
		private static var _btn:*;

		/**
		 * @private 
		 */
		private static var _count:*;

		/**
		 * 最大打印数量，超过这个数量，则自动清理一次，默认为50次
		 */
		public static var maxCount:Number;

		/**
		 * 是否自动滚动到底部，默认为true
		 */
		public static var autoScrollToBottom:Boolean;

		/**
		 * 激活Log系统，使用方法Laya.init(800,600,Laya.Log);
		 */
		public static function enable():void{}

		/**
		 * 隐藏/显示日志面板
		 */
		public static function toggle():void{}

		/**
		 * 增加日志内容。
		 * @param value 需要增加的日志内容。
		 */
		public static function print(value:String):void{}

		/**
		 * 清理日志
		 */
		public static function clear():void{}
	}

}
