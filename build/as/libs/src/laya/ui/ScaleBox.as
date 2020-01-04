package laya.ui {
	import laya.ui.Box;

	/**
	 * 自适应缩放容器，容器设置大小后，容器大小始终保持stage大小，子内容按照原始最小宽高比缩放
	 */
	public class ScaleBox extends Box {
		private var _oldW:*;
		private var _oldH:*;

		/**
		 * @override 
		 */
		override public function onEnable():void{}

		/**
		 * @override 
		 */
		override public function onDisable():void{}
		private var onResize:*;
	}

}
