/*[IF-FLASH]*/
package laya.d3.graphics.Vertex {
	improt laya.d3.graphics.IVertex;
	improt laya.d3.graphics.VertexDeclaration;
	improt laya.d3.math.Vector2;
	improt laya.d3.math.Vector3;
	public class VertexPositionTerrain implements laya.d3.graphics.IVertex {
		public static var TERRAIN_POSITION0:Number;
		public static var TERRAIN_NORMAL0:Number;
		public static var TERRAIN_TEXTURECOORDINATE0:Number;
		public static var TERRAIN_TEXTURECOORDINATE1:Number;
		private static var _vertexDeclaration:*;
		public static function get vertexDeclaration():VertexDeclaration{};
		private var _position:*;
		private var _normal:*;
		private var _textureCoord0:*;
		private var _textureCoord1:*;
		public function get position():Vector3{};
		public function get normal():Vector3{};
		public function get textureCoord0():Vector2{};
		public function get textureCoord1():Vector2{};
		public function get vertexDeclaration():VertexDeclaration{};

		public function VertexPositionTerrain(position:Vector3,normal:Vector3,textureCoord0:Vector2,textureCoord1:Vector2){}
	}

}
