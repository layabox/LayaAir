package laya.d3.graphics.Vertex {
	import laya.d3.graphics.IVertex;
	import laya.d3.graphics.VertexDeclaration;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;

	/**
	 * <code>VertexPositionTerrain</code> 类用于创建位置、法线、纹理1、纹理2顶点结构。
	 */
	public class VertexPositionTerrain implements IVertex {
		public static var TERRAIN_POSITION0:Number;
		public static var TERRAIN_NORMAL0:Number;
		public static var TERRAIN_TEXTURECOORDINATE0:Number;
		public static var TERRAIN_TEXTURECOORDINATE1:Number;
		private static var _vertexDeclaration:*;
		public static function get vertexDeclaration():VertexDeclaration{
				return null;
		}
		private var _position:*;
		private var _normal:*;
		private var _textureCoord0:*;
		private var _textureCoord1:*;
		public function get position():Vector3{
				return null;
		}
		public function get normal():Vector3{
				return null;
		}
		public function get textureCoord0():Vector2{
				return null;
		}
		public function get textureCoord1():Vector2{
				return null;
		}
		public function get vertexDeclaration():VertexDeclaration{
				return null;
		}

		public function VertexPositionTerrain(position:Vector3 = undefined,normal:Vector3 = undefined,textureCoord0:Vector2 = undefined,textureCoord1:Vector2 = undefined){}
	}

}
