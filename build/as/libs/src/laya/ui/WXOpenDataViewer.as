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

		/**
		 * @override 
		 */
		override public function set width(value:Number):void{}

		/**
		 * @override 
		 */
		override public function get width():Number{return null;}

		/**
		 * @override 
		 */
		override public function set height(value:Number):void{}

		/**
		 * @override 
		 */
		override public function get height():Number{return null;}

		/**
		 * @override 
		 */
		override public function set x(value:Number):void{}

		/**
		 * @override 
		 */
		override public function get x():Number{return null;}

		/**
		 * @override 
		 */
		override public function set y(value:Number):void{}

		/**
		 * @override 
		 */
		override public function get y():Number{return null;}
		private var _postMsg:*;

		/**
		 * 向开放数据域发送消息
		 */
		public function postMsg(msg:*):void{}
	}

}
