package laya.d3.core.trail {
	import laya.d3.math.Vector3;
	import laya.d3.core.FloatKeyframe;
	import laya.d3.core.Gradient;
	import laya.d3.core.trail.TrailSprite3D;

	/**
	 * <code>TrailFilter</code> 类用于创建拖尾过滤器。
	 */
	public class TrailFilter {
		public static var CURTIME:Number;
		public static var LIFETIME:Number;
		public static var WIDTHCURVE:Number;
		public static var WIDTHCURVEKEYLENGTH:Number;
		public var _owner:TrailSprite3D;
		public var _lastPosition:Vector3;
		public var _curtime:Number;

		/**
		 * 轨迹准线。
		 */
		public var alignment:Number;

		/**
		 * 获取淡出时间。
		 * @return 淡出时间。
		 */

		/**
		 * 设置淡出时间。
		 * @param value 淡出时间。
		 */
		public var time:Number;

		/**
		 * 获取新旧顶点之间最小距离。
		 * @return 新旧顶点之间最小距离。
		 */

		/**
		 * 设置新旧顶点之间最小距离。
		 * @param value 新旧顶点之间最小距离。
		 */
		public var minVertexDistance:Number;

		/**
		 * 获取宽度倍数。
		 * @return 宽度倍数。
		 */

		/**
		 * 设置宽度倍数。
		 * @param value 宽度倍数。
		 */
		public var widthMultiplier:Number;

		/**
		 * 获取宽度曲线。
		 * @return 宽度曲线。
		 */

		/**
		 * 设置宽度曲线。
		 * @param value 宽度曲线。
		 */
		public var widthCurve:Array;

		/**
		 * 获取颜色梯度。
		 * @return 颜色梯度。
		 */

		/**
		 * 设置颜色梯度。
		 * @param value 颜色梯度。
		 */
		public var colorGradient:Gradient;

		/**
		 * 获取纹理模式。
		 * @return 纹理模式。
		 */

		/**
		 * 设置纹理模式。
		 * @param value 纹理模式。
		 */
		public var textureMode:Number;

		public function TrailFilter(owner:TrailSprite3D = undefined){}
		public function clear():void{}

		/**
		 * 轨迹准线_面向摄像机。
		 */
		public static var ALIGNMENT_VIEW:Number;

		/**
		 * 轨迹准线_面向运动方向。
		 */
		public static var ALIGNMENT_TRANSFORM_Z:Number;
	}

}
