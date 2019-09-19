package laya.d3.core {
	import laya.d3.core.Keyframe;
	import laya.d3.math.Quaternion;
	import laya.d3.math.Vector4;

	/**
	 * <code>QuaternionKeyframe</code> 类用于创建四元数关键帧实例。
	 */
	public class QuaternionKeyframe extends Keyframe {
		public var inTangent:Vector4;
		public var outTangent:Vector4;
		public var value:Quaternion;

		/**
		 * 创建一个 <code>QuaternionKeyframe</code> 实例。
		 */

		public function QuaternionKeyframe(){}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 * @override 
		 */
		override public function cloneTo(dest:*):void{}
	}

}
