package laya.d3.graphics.Vertex {
	import laya.d3.graphics.IVertex;
	import laya.d3.graphics.VertexDeclaration;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;

	/**
	 * <code>VertexPositionNormalTexture</code> 类用于创建位置、纹理顶点结构。
	 */
	public class VertexPositionTexture0 implements IVertex {
		private static var _vertexDeclaration:*;
		public static function get vertexDeclaration():VertexDeclaration{
				return null;
		}
		private var _position:*;
		private var _textureCoordinate0:*;
		public function get position():Vector3{
				return null;
		}
		public function get textureCoordinate0():Vector2{
				return null;
		}
		public function get vertexDeclaration():VertexDeclaration{
				return null;
		}

		public function VertexPositionTexture0(position:Vector3 = undefined,textureCoordinate0:Vector2 = undefined){}
	}

}
