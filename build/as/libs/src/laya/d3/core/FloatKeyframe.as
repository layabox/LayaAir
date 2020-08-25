package laya.d3.core {
	import laya.d3.core.Keyframe;

	/**
	 * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
	 */
	public class FloatKeyframe extends Keyframe {
		public var inTangent:Number;
		public var outTangent:Number;
		public var value:Number;

		/**
		 * 创建一个 <code>FloatKeyFrame</code> 实例。
		 */

		public function FloatKeyframe(){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function cloneTo(destObject:*):void{}
	}

}
