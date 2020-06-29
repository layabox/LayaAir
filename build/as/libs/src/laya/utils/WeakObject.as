package laya.utils {

	/**
	 * 封装弱引用WeakMap
	 * 如果支持WeakMap，则使用WeakMap，如果不支持，则用Object代替
	 * 注意：如果采用Object，为了防止内存泄漏，则采用定时清理缓存策略
	 * 
	 * 这里的设计是错误的，为了兼容，先不删掉这个类，直接采用Object
	 */
	public class WeakObject {

		/**
		 * 是否支持WeakMap
		 */
		public static var supportWeakMap:Boolean;

		/**
		 * 如果不支持WeakMap，则多少时间清理一次缓存，默认10分钟清理一次
		 */
		public static var delInterval:Number;

		/**
		 * 全局WeakObject单例
		 */
		public static var I:WeakObject;

		/**
		 * @private 
		 */
		private static var _maps:*;

		/**
		 * 清理缓存，回收内存
		 */
		public static function clearCache():void{}

		public function WeakObject(){}

		/**
		 * 设置缓存
		 * @param key kye对象，可被回收
		 * @param value object对象，可被回收
		 */
		public function set(key:*,value:*):void{}

		/**
		 * 获取缓存
		 * @param key kye对象，可被回收
		 */
		public function get(key:*):*{}

		/**
		 * 删除缓存
		 */
		public function del(key:*):void{}

		/**
		 * 是否有缓存
		 */
		public function has(key:*):Boolean{
			return null;
		}
	}

}
