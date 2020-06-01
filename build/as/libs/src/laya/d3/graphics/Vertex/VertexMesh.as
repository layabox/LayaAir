package laya.d3.graphics.Vertex {
	import laya.d3.graphics.VertexDeclaration;

	/**
	 * ...
	 * @author ...
	 */
	public class VertexMesh {
		public static var MESH_POSITION0:Number;
		public static var MESH_COLOR0:Number;
		public static var MESH_TEXTURECOORDINATE0:Number;
		public static var MESH_NORMAL0:Number;
		public static var MESH_TANGENT0:Number;
		public static var MESH_BLENDINDICES0:Number;
		public static var MESH_BLENDWEIGHT0:Number;
		public static var MESH_TEXTURECOORDINATE1:Number;
		public static var MESH_WORLDMATRIX_ROW0:Number;
		public static var MESH_WORLDMATRIX_ROW1:Number;
		public static var MESH_WORLDMATRIX_ROW2:Number;
		public static var MESH_WORLDMATRIX_ROW3:Number;
		public static var MESH_MVPMATRIX_ROW0:Number;
		public static var MESH_MVPMATRIX_ROW1:Number;
		public static var MESH_MVPMATRIX_ROW2:Number;
		public static var MESH_MVPMATRIX_ROW3:Number;
		public static var instanceWorldMatrixDeclaration:VertexDeclaration;
		public static var instanceMVPMatrixDeclaration:VertexDeclaration;

		/**
		 * 获取顶点声明。
		 * @param vertexFlag 顶点声明标记字符,格式为:"POSITION,NORMAL,COLOR,UV,UV1,BLENDWEIGHT,BLENDINDICES,TANGENT"。
		 * @return 顶点声明。
		 */
		public static function getVertexDeclaration(vertexFlag:String,compatible:Boolean = null):VertexDeclaration{
			return null;
		}
	}

}
