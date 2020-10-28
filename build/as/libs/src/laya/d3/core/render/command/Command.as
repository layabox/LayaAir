package laya.d3.core.render.command {
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
		 */
		public function run():void{}

		/**
		 */
		public function recover():void{}
		public function setContext(context:RenderContext3D):void{}
	}

}
