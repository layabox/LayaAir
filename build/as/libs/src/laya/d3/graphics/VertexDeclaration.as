/*[IF-FLASH]*/
package laya.d3.graphics {
	improt laya.d3.graphics.VertexElement;
	public class VertexDeclaration {
		public function get id():Number{};
		public function get vertexStride():Number{};
		public function get vertexElementCount():Number{};

		public function VertexDeclaration(vertexStride:Number,vertexElements:Array){}
		public function getVertexElementByIndex(index:Number):VertexElement{}
	}

}
