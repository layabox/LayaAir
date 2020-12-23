
/**
 * 相机事件标记
 */
package laya.d3.core {

	public class CameraEventFlags {

		/**
		 * 在渲染非透明物体之前。
		 */
		public static var BeforeForwardOpaque:Number = 0;

		/**
		 * 在渲染天空盒之前。
		 */
		public static var BeforeSkyBox:Number = 2;

		/**
		 * 在渲染透明物体之前。
		 */
		public static var BeforeTransparent:Number = 4;

		/**
		 * 在后期处理之前。
		 */
		public static var BeforeImageEffect:Number = 6;

		/**
		 * 所有渲染之后。
		 */
		public static var AfterEveryThing:Number = 8;

	}
}