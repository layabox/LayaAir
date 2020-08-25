package laya.d3.utils {
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Ray;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;
	import laya.d3.math.Viewport;

	/**
	 * <code>Picker</code> 类用于创建拾取。
	 */
	public class Picker {
		private static var _tempVector30:*;
		private static var _tempVector31:*;
		private static var _tempVector32:*;
		private static var _tempVector33:*;
		private static var _tempVector34:*;

		/**
		 * 创建一个 <code>Picker</code> 实例。
		 */

		public function Picker(){}

		/**
		 * 计算鼠标生成的射线。
		 * @param point 鼠标位置。
		 * @param viewPort 视口。
		 * @param projectionMatrix 透视投影矩阵。
		 * @param viewMatrix 视图矩阵。
		 * @param world 世界偏移矩阵。
		 * @return out  输出射线。
		 */
		public static function calculateCursorRay(point:Vector2,viewPort:Viewport,projectionMatrix:Matrix4x4,viewMatrix:Matrix4x4,world:Matrix4x4,out:Ray):void{}

		/**
		 * 计算射线和三角形碰撞并返回碰撞距离。
		 * @param ray 射线。
		 * @param vertex1 顶点1。
		 * @param vertex2 顶点2。
		 * @param vertex3 顶点3。
		 * @return 射线距离三角形的距离，返回Number.NaN则不相交。
		 */
		public static function rayIntersectsTriangle(ray:Ray,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Number{
			return null;
		}
	}

}
