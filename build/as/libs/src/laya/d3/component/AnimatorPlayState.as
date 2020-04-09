package laya.d3.component {
	import laya.d3.component.AnimatorState;

	/**
	 * <code>AnimatorPlayState</code> 类用于创建动画播放状态信息。
	 */
	public class AnimatorPlayState {

		/**
		 * 播放状态的归一化时间,整数为循环次数，小数为单次播放时间。
		 */
		public function get normalizedTime():Number{
				return null;
		}

		/**
		 * 当前动画的持续时间，以秒为单位。
		 */
		public function get duration():Number{
				return null;
		}

		/**
		 * 动画状态机。
		 */
		public function get animatorState():AnimatorState{
				return null;
		}

		/**
		 * 创建一个 <code>AnimatorPlayState</code> 实例。
		 */

		public function AnimatorPlayState(){}
	}

}
