package laya.ani.bone.canvasmesh 
{
	import laya.maths.Matrix;
	import laya.maths.Rectangle;
	import laya.resource.Texture;
	/**
	 * @private
	 */
	public class MeshData 
	{
		/**
		 * 纹理 
		 */		
		public var texture:Texture;
		
		/**
		 * uv数据 
		 */		
		public var uvs:Float32Array = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
		
		/**
		 * 顶点数据 
		 */		
		public var vertices:Float32Array = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
		
		/**
		 * 顶点索引 
		 */		
		public var indexes:Uint16Array = new Uint16Array([0, 1, 3, 3, 1, 2]);
		
		/**
		 * uv变换矩阵 
		 */		
		public var uvTransform:Matrix;
		
		/**
		 * 是否有uv变化矩阵
		 */		
		public var useUvTransform:Boolean = false;
		
		/**
		 * 扩展像素,用来去除黑边 
		 */		
		public var canvasPadding:Number = 1;
		
		/**
		 * 计算mesh的Bounds 
		 * @return 
		 * 
		 */		
		//TODO:coverage
		public function getBounds():Rectangle
		{
			return Rectangle._getWrapRec(vertices);
		}
	}

}