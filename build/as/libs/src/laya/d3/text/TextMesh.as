package laya.d3.text {
	import laya.d3.math.Color;

	/**
	 * <code>TextMesh</code> 类用于创建文本网格。
	 */
	public class TextMesh {
		private static var _indexBuffer:*;
		private var _vertices:*;
		private var _vertexBuffer:*;
		private var _text:*;
		private var _fontSize:*;
		private var _color:*;

		/**
		 * 获取文本。
		 * @return 文本。
		 */

		/**
		 * 设置文本。
		 * @param value 文本。
		 */
		public var text:String;

		/**
		 * 获取字体尺寸。
		 * @param value 字体尺寸。
		 */

		/**
		 * 设置字体储存。
		 * @return 字体尺寸。
		 */
		public var fontSize:Number;

		/**
		 * 获取颜色。
		 * @return 颜色。
		 */

		/**
		 * 设置颜色。
		 * @param 颜色 。
		 */
		public var color:Color;

		/**
		 * 创建一个新的 <code>TextMesh</code> 实例。
		 */

		public function TextMesh(){}
		private var _createVertexBuffer:*;
		private var _resizeVertexBuffer:*;
		private var _addChar:*;
	}

}
