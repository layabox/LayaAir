package laya.d3.component {
	import laya.d3.animation.AnimationClip;
	import laya.d3.animation.AnimatorStateScript;
	import laya.d3.core.IClone;
	import laya.d3.resource.IReferenceCounter;

	/**
	 * <code>AnimatorState</code> 类用于创建动作状态。
	 */
	public class AnimatorState implements IReferenceCounter,IClone {

		/**
		 * 名称。
		 */
		public var name:String;

		/**
		 * 动画播放速度,1.0为正常播放速度。
		 */
		public var speed:Number;

		/**
		 * 动作播放起始时间。
		 */
		public var clipStart:Number;

		/**
		 * 动作播放结束时间。
		 */
		public var clipEnd:Number;

		/**
		 * 动作。
		 */
		public var clip:AnimationClip;

		/**
		 * 创建一个 <code>AnimatorState</code> 实例。
		 */

		public function AnimatorState(){}

		/**
		 * @implements IReferenceCounter
		 */
		public function _getReferenceCount():Number{
			return null;
		}

		/**
		 * @implements IReferenceCounter
		 */
		public function _addReference(count:Number):void{}

		/**
		 * @implements IReferenceCounter
		 */
		public function _removeReference(count:Number):void{}

		/**
		 * @implements IReferenceCounter
		 */
		public function _clearReference():void{}

		/**
		 * 添加脚本。
		 * @param type 组件类型。
		 * @return 脚本。
		 */
		public function addScript(type:*):AnimatorStateScript{
			return null;
		}

		/**
		 * 获取脚本。
		 * @param type 组件类型。
		 * @return 脚本。
		 */
		public function getScript(type:*):AnimatorStateScript{
			return null;
		}

		/**
		 * 获取脚本集合。
		 * @param type 组件类型。
		 * @return 脚本集合。
		 */
		public function getScripts(type:*):Array{
			return null;
		}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
