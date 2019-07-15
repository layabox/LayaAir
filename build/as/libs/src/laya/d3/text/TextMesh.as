/*[IF-FLASH]*/
package laya.d3.text {
	improt laya.d3.math.Color;
	public class TextMesh {
		private static var _indexBuffer:*;
		private var _vertices:*;
		private var _vertexBuffer:*;
		private var _text:*;
		private var _fontSize:*;
		private var _color:*;
		public var text:String;
		public var fontSize:Number;
		public var color:Color;

		public function TextMesh(){}
		private var _createVertexBuffer:*;
		private var _resizeVertexBuffer:*;
		private var _addChar:*;
	}

}
