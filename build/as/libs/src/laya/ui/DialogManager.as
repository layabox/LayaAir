/*[IF-FLASH]*/
package laya.ui {
	improt laya.display.Sprite;
	improt laya.ui.Dialog;
	improt laya.ui.UIComponent;
	improt laya.utils.Handler;
	public class DialogManager extends laya.display.Sprite {
		public var maskLayer:Sprite;
		public var lockLayer:Sprite;
		public var popupEffect:Function;
		public var closeEffect:Function;
		public var popupEffectHandler:Handler;
		public var closeEffectHandler:Handler;

		public function DialogManager(){}
		private var _closeOnSide:*;
		public function setLockView(value:UIComponent):void{}
		private var _onResize:*;
		private var _centerDialog:*;
		public function open(dialog:Dialog,closeOther:Boolean = null,showEffect:Boolean = null):void{}
		private var _clearDialogEffect:*;
		public function doOpen(dialog:Dialog):void{}
		public function lock(value:Boolean):void{}
		public function close(dialog:Dialog):void{}
		public function doClose(dialog:Dialog):void{}
		public function closeAll():void{}
		private var _closeAll:*;
		public function getDialogsByGroup(group:String):Array{}
		public function closeByGroup(group:String):Array{}
	}

}
