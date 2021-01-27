
/**
 * 渲染模式。
 */
package laya.d3.core.material {

	public class PBRRenderMode {

		/**
		 * 不透明。
		 */
		public static var Opaque:Number = 0;

		/**
		 * 透明裁剪。
		 */
		public static var Cutout:Number = 1;

		/**
		 * 透明混合_游戏中经常使用的透明。
		 */
		public static var Fade:Number = 2;

		/**
		 * 透明混合_物理上看似合理的透明。
		 */
		public static var Transparent:Number = 3;

	}
}