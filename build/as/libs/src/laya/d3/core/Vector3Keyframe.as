package laya.d3.core {
	import laya.d3.core.Keyframe;
	import laya.d3.math.Vector3;

	/**
	 * <code>Vector3Keyframe</code> 类用于创建三维向量关键帧实例。
	 */
	public class Vector3Keyframe extends Keyframe {
		public var inTangent:Vector3;
		public var outTangent:Vector3;
		public var value:Vector3;

		/**
		 * 创建一个 <code>Vector3Keyframe</code> 实例。
		 */

		public function Vector3Keyframe(){}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 * @override 
		 */
		override public function cloneTo(dest:*):void{}
	}

}
