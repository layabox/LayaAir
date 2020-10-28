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
		public function get time():Number{return null;}

		/**
		 * 设置淡出时间。
		 * @param value 淡出时间。
		 */
		public function set time(value:Number):void{}

		/**
		 * 获取新旧顶点之间最小距离。
		 * @return 新旧顶点之间最小距离。
		 */
		public function get minVertexDistance():Number{return null;}

		/**
		 * 设置新旧顶点之间最小距离。
		 * @param value 新旧顶点之间最小距离。
		 */
		public function set minVertexDistance(value:Number):void{}

		/**
		 * 获取宽度倍数。
		 * @return 宽度倍数。
		 */
		public function get widthMultiplier():Number{return null;}

		/**
		 * 设置宽度倍数。
		 * @param value 宽度倍数。
		 */
		public function set widthMultiplier(value:Number):void{}

		/**
		 * 获取宽度曲线。
		 * @return 宽度曲线。
		 */
		public function get widthCurve():Array{return null;}

		/**
		 * 设置宽度曲线。
		 * @param value 宽度曲线。
		 */
		public function set widthCurve(value:Array):void{}

		/**
		 * 获取颜色梯度。
		 * @return 颜色梯度。
		 */
		public function get colorGradient():Gradient{return null;}

		/**
		 * 设置颜色梯度。
		 * @param value 颜色梯度。
		 */
		public function set colorGradient(value:Gradient):void{}

		/**
		 * 获取纹理模式。
		 * @return 纹理模式。
		 */
		public function get textureMode():Number{return null;}

		/**
		 * 设置纹理模式。
		 * @param value 纹理模式。
		 */
		public function set textureMode(value:Number):void{}

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
