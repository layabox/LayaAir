package laya.d3.animation {
	import laya.d3.animation.AnimationNode;
	import laya.events.EventDispatcher;

	/**
	 * <code>AnimationTransform3D</code> 类用于实现3D变换。
	 */
	public class AnimationTransform3D extends EventDispatcher {
		private static var _tempVector3:*;
		private static var _angleToRandin:*;
		private var _localMatrix:*;
		private var _worldMatrix:*;
		private var _localPosition:*;
		private var _localRotation:*;
		private var _localScale:*;
		private var _localQuaternionUpdate:*;
		private var _locaEulerlUpdate:*;
		private var _localUpdate:*;
		private var _parent:*;
		private var _children:*;

		/**
		 * 创建一个 <code>Transform3D</code> 实例。
		 * @param owner 所属精灵。
		 */

		public function AnimationTransform3D(owner:AnimationNode = undefined,localPosition:Float32Array = undefined,localRotation:Float32Array = undefined,localScale:Float32Array = undefined,worldMatrix:Float32Array = undefined){}
		private var _getlocalMatrix:*;
		private var _onWorldTransform:*;

		/**
		 * 获取世界矩阵。
		 * @return 世界矩阵。
		 */
		public function getWorldMatrix():Float32Array{
			return null;
		}

		/**
		 * 设置父3D变换。
		 * @param value 父3D变换。
		 */
		public function setParent(value:AnimationTransform3D):void{}
	}

}
