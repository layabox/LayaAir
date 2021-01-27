package laya.d3.core.render.command {
	import laya.d3.core.render.RenderContext3D;
	import laya.d3.core.render.RenderContext3D;

	/**
	 * <code>Command</code> 类用于创建指令。
	 */
	public class Command {

		/**
		 * 创建一个 <code>Command</code> 实例。
		 */

		public function Command(){}

		/**
		 * 运行渲染指令
		 */
		public function run():void{}

		/**
		 * 回收渲染指令
		 */
		public function recover():void{}

		/**
		 * 设置渲染上下文
		 * @param context 渲染上下文
		 */
		public function setContext(context:RenderContext3D):void{}
	}

}
