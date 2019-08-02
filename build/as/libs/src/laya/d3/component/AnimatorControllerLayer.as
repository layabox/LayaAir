package laya.d3.component {
	import laya.d3.component.AnimatorState;
	import laya.d3.core.IClone;
	import laya.d3.resource.IReferenceCounter;

	/*
	 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
	 */
	public class AnimatorControllerLayer implements laya.d3.resource.IReferenceCounter,laya.d3.core.IClone {
		private var _defaultState:*;
		private var _referenceCount:*;

		/*
		 * 层的名称。
		 */
		public var name:String;

		/*
		 * 名称。
		 */
		public var blendingMode:Number;

		/*
		 * 权重。
		 */
		public var defaultWeight:Number;

		/*
		 * 激活时是否自动播放
		 */
		public var playOnWake:Boolean;

		/*
		 * 获取默认动画状态。
		 * @return 默认动画状态。
		 */

		/*
		 * 设置默认动画状态。
		 * @param value 默认动画状态。
		 */
		public var defaultState:AnimatorState;

		/*
		 * 创建一个 <code>AnimatorControllerLayer</code> 实例。
		 */

		public function AnimatorControllerLayer(name:String = undefined){}
		private var _removeClip:*;

		/*
		 * @implements IReferenceCounter
		 */
		public function _getReferenceCount():Number{
			return null;
		}

		/*
		 * @implements IReferenceCounter
		 */
		public function _addReference(count:Number):void{}

		/*
		 * @implements IReferenceCounter
		 */
		public function _removeReference(count:Number):void{}

		/*
		 * @implements IReferenceCounter
		 */
		public function _clearReference():void{}

		/*
		 * 获取动画状态。
		 */
		public function getAnimatorState(name:String):AnimatorState{
			return null;
		}

		/*
		 * 添加动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		public function addState(state:AnimatorState):void{}

		/*
		 * 移除动画状态。
		 * @param state 动画状态。
		 * @param layerIndex 层索引。
		 */
		public function removeState(state:AnimatorState):void{}

		/*
		 * 销毁。
		 */
		public function destroy():void{}

		/*
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/*
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
