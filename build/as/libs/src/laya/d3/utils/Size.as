package laya.d3.utils {

	/**
	 */
	public class Size {

		/**
		 * 全局场景的屏幕大小
		 */
		public static function get fullScreen():Size{return null;}
		private var _width:*;
		private var _height:*;

		/**
		 * 宽度
		 */
		public function get width():Number{return null;}

		/**
		 * 高度
		 */
		public function get height():Number{return null;}

		/**
		 * 创建Size实例
		 * @param width 宽度
		 * @param height 高度
		 */

		public function Size(width:Number = undefined,height:Number = undefined){}
	}

}
