package laya.ani.bone.canvasmesh {
	import laya.resource.Texture;
	import laya.maths.Matrix;
	import laya.maths.Rectangle;

	/**
	 */
	public class MeshData {

		/**
		 * 纹理
		 */
		public var texture:Texture;

		/**
		 * uv数据
		 */
		public var uvs:Float32Array;

		/**
		 * 顶点数据
		 */
		public var vertices:Float32Array;

		/**
		 * 顶点索引
		 */
		public var indexes:Uint16Array;

		/**
		 * uv变换矩阵
		 */
		public var uvTransform:Matrix;

		/**
		 * 是否有uv变化矩阵
		 */
		public var useUvTransform:Boolean;

		/**
		 * 扩展像素,用来去除黑边
		 */
		public var canvasPadding:Number;

		/**
		 * 计算mesh的Bounds
		 * @return 
		 */
		public function getBounds():Rectangle{
			return null;
		}
	}

}
