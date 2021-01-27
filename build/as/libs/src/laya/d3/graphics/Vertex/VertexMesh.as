package laya.d3.graphics.Vertex {
	import laya.d3.graphics.VertexDeclaration;
	import laya.d3.graphics.VertexDeclaration;

	/**
	 * ...
	 * @author ...
	 */
	public class VertexMesh {

		/**
		 * 顶点位置数据
		 */
		public static var MESH_POSITION0:Number;

		/**
		 * 顶点顶点色数据
		 */
		public static var MESH_COLOR0:Number;

		/**
		 * 顶点UV0数据
		 */
		public static var MESH_TEXTURECOORDINATE0:Number;

		/**
		 * 顶点法线数据
		 */
		public static var MESH_NORMAL0:Number;

		/**
		 * 顶点切线数据
		 */
		public static var MESH_TANGENT0:Number;

		/**
		 * 顶点骨骼索引数据
		 */
		public static var MESH_BLENDINDICES0:Number;

		/**
		 * 顶点骨骼权重数据
		 */
		public static var MESH_BLENDWEIGHT0:Number;

		/**
		 * 顶点UV1数据
		 */
		public static var MESH_TEXTURECOORDINATE1:Number;

		/**
		 * 顶点世界矩阵数据Row0
		 */
		public static var MESH_WORLDMATRIX_ROW0:Number;

		/**
		 * 顶点世界矩阵数据Row1
		 */
		public static var MESH_WORLDMATRIX_ROW1:Number;

		/**
		 * 顶点世界矩阵数据Row2
		 */
		public static var MESH_WORLDMATRIX_ROW2:Number;

		/**
		 * 顶点世界矩阵数据Row3
		 */
		public static var MESH_WORLDMATRIX_ROW3:Number;

		/**
		 * 顶点MVP矩阵数据Row0
		 */
		public static var MESH_MVPMATRIX_ROW0:Number;

		/**
		 * 顶点MVP矩阵数据Row1
		 */
		public static var MESH_MVPMATRIX_ROW1:Number;

		/**
		 * 顶点MVP矩阵数据Row2
		 */
		public static var MESH_MVPMATRIX_ROW2:Number;

		/**
		 * 顶点MVP矩阵数据Row3
		 */
		public static var MESH_MVPMATRIX_ROW3:Number;

		/**
		 * 简单数据动画数据
		 */
		public static var MESH_SIMPLEANIMATOR:Number;

		/**
		 * instanceworld顶点描述
		 */
		public static var instanceWorldMatrixDeclaration:VertexDeclaration;

		/**
		 * instanceMVP顶点描述
		 */
		public static var instanceMVPMatrixDeclaration:VertexDeclaration;

		/**
		 * instanceSimple动画数据顶点描述
		 */
		public static var instanceSimpleAnimatorDeclaration:VertexDeclaration;

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
