/*[IF-FLASH]*/
package laya.d3.animation {
	improt laya.d3.animation.AnimationNode;
	improt laya.events.EventDispatcher;
	public class AnimationTransform3D extends laya.events.EventDispatcher {
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

		public function AnimationTransform3D(owner:AnimationNode,localPosition:Float32Array = null,localRotation:Float32Array = null,localScale:Float32Array = null,worldMatrix:Float32Array = null){}
		private var _getlocalMatrix:*;
		private var _onWorldTransform:*;
		public function getWorldMatrix():Float32Array{}
		public function setParent(value:AnimationTransform3D):void{}
	}

}
