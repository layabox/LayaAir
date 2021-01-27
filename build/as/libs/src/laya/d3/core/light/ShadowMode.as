
/**
 * 阴影模式。
 */
package laya.d3.core.light {

	public class ShadowMode {

		/**
		 * 不产生阴影。
		 */
		public static var None:Number = 0;

		/**
		 * 硬阴影，对性能要求较低。
		 */
		public static var Hard:Number = 1;

		/**
		 * 低强度软阴影，对性能要求一般。
		 */
		public static var SoftLow:Number = 2;

		/**
		 * 高强度软阴影,对性能要求较高。
		 */
		public static var SoftHigh:Number = 3;

	}
}