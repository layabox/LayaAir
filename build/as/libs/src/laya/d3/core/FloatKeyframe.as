package laya.d3.core {
	import laya.d3.core.Keyframe;

	/**
	 * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
	 */
	public class FloatKeyframe extends Keyframe {

		/**
		 * 内切线
		 */
		public var inTangent:Number;

		/**
		 * 外切线
		 */
		public var outTangent:Number;

		/**
		 * 帧数据
		 */
		public var value:Number;

		/**
		 * 创建一个 <code>FloatKeyFrame</code> 实例。
		 */

		public function FloatKeyframe(){}

		/**
		 * 克隆数据
		 * @inheritDoc 
		 * @override 
		 */
		override public function cloneTo(destObject:*):void{}
	}

}
