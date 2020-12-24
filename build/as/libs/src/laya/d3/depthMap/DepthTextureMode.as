
/**
 * 深度贴图模式
 */
package laya.d3.depthMap {

	public class DepthTextureMode {

		/**
		 * 不生成深度贴图
		 */
		public static var None:Number = 0;

		/**
		 * 生成深度贴图
		 */
		public static var Depth:Number = 1;

		/**
		 * 生成深度+法线贴图
		 */
		public static var DepthNormals:Number = 2;

		/**
		 * 是否应渲染运动矢量  TODO
		 */
		public static var MotionVectors:Number = 4;

	}
}