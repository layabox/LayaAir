/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.View;
	improt laya.ui.DialogManager;
	improt laya.ui.UIComponent;
	improt laya.events.Event;
	improt laya.utils.Handler;
	public class Dialog extends laya.ui.View {
		public static var CLOSE:String;
		public static var CANCEL:String;
		public static var SURE:String;
		public static var NO:String;
		public static var YES:String;
		public static var OK:String;
		private static var _manager:*;
		public static var manager:DialogManager;
		public var closeHandler:Handler;
		public var popupEffect:Handler;
		public var closeEffect:Handler;
		public var group:String;
		public var isModal:Boolean;
		public var isShowEffect:Boolean;
		public var isPopupCenter:Boolean;
		public var closeType:String;
		private var _dragArea:*;

		public function Dialog(){}
		protected function _dealDragArea():void{}
		public var dragArea:String;
		private var _onMouseDown:*;
		protected function _onClick(e:Event):void{}
		public function open(closeOther:Boolean = null,param:* = null):void{}
		public function close(type:String = null):void{}
		public function destroy(destroyChild:Boolean = null):void{}
		public function show(closeOther:Boolean = null,showEffect:Boolean = null):void{}
		public function popup(closeOther:Boolean = null,showEffect:Boolean = null):void{}
		protected function _open(modal:Boolean,closeOther:Boolean,showEffect:Boolean):void{}
		public function get isPopup():Boolean{};
		public var zOrder:Number;
		public static function setLockView(view:UIComponent):void{}
		public static function lock(value:Boolean):void{}
		public static function closeAll():void{}
		public static function getDialogsByGroup(group:String):Array{}
		public static function closeByGroup(group:String):Array{}
	}

}
