package laya.net {

	/**
	 * <p> <code>LocalStorage</code> 类用于没有时间限制的数据存储。</p>
	 */
	public class LocalStorage {

		/**
		 * @ 基础类
		 */
		public static var _baseClass:*;

		/**
		 * 数据列表。
		 */
		public static var items:*;

		/**
		 * 表示是否支持  <code>LocalStorage</code>。
		 */
		public static var support:Boolean;

		/**
		 * 存储指定键名和键值，字符串类型。
		 * @param key 键名。
		 * @param value 键值。
		 */
		public static function setItem(key:String,value:String):void{}

		/**
		 * 获取指定键名的值。
		 * @param key 键名。
		 * @return 字符串型值。
		 */
		public static function getItem(key:String):String{
			return null;
		}

		/**
		 * 存储指定键名及其对应的 <code>Object</code> 类型值。
		 * @param key 键名。
		 * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
		 */
		public static function setJSON(key:String,value:*):void{}

		/**
		 * 获取指定键名对应的 <code>Object</code> 类型值。
		 * @param key 键名。
		 * @return <code>Object</code> 类型值
		 */
		public static function getJSON(key:String):*{}

		/**
		 * 删除指定键名的信息。
		 * @param key 键名。
		 */
		public static function removeItem(key:String):void{}

		/**
		 * 清除本地存储信息。
		 */
		public static function clear():void{}
	}

}
