package laya.gltf {

	public class glTFAnimationSamplerInterpolation {

		/**
		 * The animated values are linearly interpolated between keyframes
		 */
		public static var LINEAR:String = "LINEAR";

		/**
		 * The animated values remain constant to the output of the first keyframe, until the next keyframe
		 */
		public static var STEP:String = "STEP";

		/**
		 * The animation's interpolation is computed using a cubic spline with specified tangents
		 */
		public static var CUBICSPLINE:String = "CUBICSPLINE";

	}
}