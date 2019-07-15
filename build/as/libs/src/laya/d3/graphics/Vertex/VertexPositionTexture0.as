/*[IF-FLASH]*/
package laya.d3.graphics.Vertex {
	improt laya.d3.graphics.IVertex;
	improt laya.d3.graphics.VertexDeclaration;
	improt laya.d3.math.Vector2;
	improt laya.d3.math.Vector3;
	public class VertexPositionTexture0 implements laya.d3.graphics.IVertex {
		private static var _vertexDeclaration:*;
		public static function get vertexDeclaration():VertexDeclaration{};
		private var _position:*;
		private var _textureCoordinate0:*;
		public function get position():Vector3{};
		public function get textureCoordinate0():Vector2{};
		public function get vertexDeclaration():VertexDeclaration{};

		public function VertexPositionTexture0(position:Vector3,textureCoordinate0:Vector2){}
	}

}
