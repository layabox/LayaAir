package laya.utils {

	/**
	 * @private <code>HTMLChar</code> 是一个 HTML 字符类。
	 */
	public class HTMLChar {
		private static var _isWordRegExp:*;

		/**
		 * x坐标
		 */
		public var x:Number;

		/**
		 * y坐标
		 */
		public var y:Number;

		/**
		 * 宽
		 */
		public var width:Number;

		/**
		 * 高
		 */
		public var height:Number;

		/**
		 * 表示是否是正常单词(英文|.|数字)。
		 */
		public var isWord:Boolean;

		/**
		 * 字符。
		 */
		public var char:String;

		/**
		 * 字符数量。
		 */
		public var charNum:Number;

		/**
		 * CSS 样式。
		 */
		public var style:*;

		/**
		 * 创建实例
		 */

		public function HTMLChar(){}

		/**
		 * 根据指定的字符、宽高、样式，创建一个 <code>HTMLChar</code> 类的实例。
		 * @param char 字符。
		 * @param w 宽度。
		 * @param h 高度。
		 * @param style CSS 样式。
		 */
		public function setData(char:String,w:Number,h:Number,style:*):HTMLChar{
			return null;
		}

		/**
		 * 重置
		 */
		public function reset():HTMLChar{
			return null;
		}

		/**
		 * 回收
		 */
		public function recover():void{}

		/**
		 * 创建
		 */
		public static function create():HTMLChar{
			return null;
		}
	}

}
