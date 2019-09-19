package laya.utils {

	/**
	 * @private <code>StringKey</code> 类用于存取字符串对应的数字。
	 */
	public class StringKey {
		private var _strsToID:*;
		private var _idToStrs:*;
		private var _length:*;

		/**
		 * 添加一个字符。
		 * @param str 字符，将作为key 存储相应生成的数字。
		 * @return 此字符对应的数字。
		 */
		public function add(str:String):Number{
			return null;
		}

		/**
		 * 获取指定字符对应的ID。
		 * @param str 字符。
		 * @return 此字符对应的ID。
		 */
		public function getID(str:String):Number{
			return null;
		}

		/**
		 * 根据指定ID获取对应字符。
		 * @param id ID。
		 * @return 此id对应的字符。
		 */
		public function getName(id:Number):String{
			return null;
		}
	}

}
