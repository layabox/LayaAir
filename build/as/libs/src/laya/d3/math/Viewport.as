package laya.d3.math {
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;

	/**
	 * <code>Viewport</code> 类用于创建视口。
	 */
	public class Viewport {

		/**
		 * X轴坐标
		 */
		public var x:Number;

		/**
		 * Y轴坐标
		 */
		public var y:Number;

		/**
		 * 宽度
		 */
		public var width:Number;

		/**
		 * 高度
		 */
		public var height:Number;

		/**
		 * 最小深度
		 */
		public var minDepth:Number;

		/**
		 * 最大深度
		 */
		public var maxDepth:Number;

		/**
		 * 创建一个 <code>Viewport</code> 实例。
		 * @param x x坐标。
		 * @param y y坐标。
		 * @param width 宽度。
		 * @param height 高度。
		 */

		public function Viewport(x:Number = undefined,y:Number = undefined,width:Number = undefined,height:Number = undefined){}

		/**
		 * 投影一个三维向量到视口空间。
		 * @param source 三维向量。
		 * @param matrix 变换矩阵。
		 * @param out x、y、z为视口空间坐标,透视投影下w为相对于变换矩阵的z轴坐标。
		 */
		public function project(source:Vector3,matrix:Matrix4x4,out:Vector4):void{}

		/**
		 * 反变换一个三维向量。
		 * @param source 源三维向量。
		 * @param matrix 变换矩阵。
		 * @param out 输出三维向量。
		 */
		public function unprojectFromMat(source:Vector3,matrix:Matrix4x4,out:Vector3):void{}

		/**
		 * 反变换一个三维向量。
		 * @param source 源三维向量。
		 * @param projection 透视投影矩阵。
		 * @param view 视图矩阵。
		 * @param world 世界矩阵,可设置为null。
		 * @param out 输出向量。
		 */
		public function unprojectFromWVP(source:Vector3,projection:Matrix4x4,view:Matrix4x4,world:Matrix4x4,out:Vector3):void{}

		/**
		 * 克隆
		 * @param out 
		 */
		public function cloneTo(out:Viewport):void{}
	}

}
