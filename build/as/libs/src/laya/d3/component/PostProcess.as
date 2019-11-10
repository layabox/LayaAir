package laya.d3.component {
	import laya.d3.core.render.PostProcessEffect;

	/**
	 * <code>PostProcess</code> 类用于创建后期处理组件。
	 */
	public class PostProcess {

		/**
		 * 创建一个 <code>PostProcess</code> 实例。
		 */

		public function PostProcess(){}

		/**
		 * 添加后期处理效果。
		 */
		public function addEffect(effect:PostProcessEffect):void{}

		/**
		 * 移除后期处理效果。
		 */
		public function removeEffect(effect:PostProcessEffect):void{}
	}

}
