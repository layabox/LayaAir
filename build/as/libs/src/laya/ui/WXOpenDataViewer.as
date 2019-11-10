package laya.ui {
	import laya.ui.UIComponent;

	/**
	 * 微信开放数据展示组件，直接实例本组件，即可根据组件宽高，位置，以最优的方式显示开放域数据
	 */
	public class WXOpenDataViewer extends UIComponent {

		public function WXOpenDataViewer(){}

		/**
		 * @override 
		 */
		override public function onEnable():void{}

		/**
		 * @override 
		 */
		override public function onDisable():void{}
		private var _onLoop:*;
		private var _postMsg:*;

		/**
		 * 向开放数据域发送消息
		 */
		public function postMsg(msg:*):void{}
	}

}
