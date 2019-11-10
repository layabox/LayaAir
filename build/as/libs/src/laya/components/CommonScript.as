package laya.components {
	import laya.components.Component;

	/**
	 * <code>CommonScript</code> 类用于创建公共脚本类。
	 */
	public class CommonScript extends Component {

		public function CommonScript(){}

		/**
		 * 创建后只执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onAwake():void{}

		/**
		 * 每次启动后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onEnable():void{}

		/**
		 * 第一次执行update之前执行，只会执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onStart():void{}

		/**
		 * 每帧更新时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onUpdate():void{}

		/**
		 * 每帧更新时执行，在update之后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onLateUpdate():void{}

		/**
		 * 禁用时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onDisable():void{}

		/**
		 * 销毁时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onDestroy():void{}
	}

}
