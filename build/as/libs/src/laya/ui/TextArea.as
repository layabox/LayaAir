/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.TextInput;
	improt laya.ui.VScrollBar;
	improt laya.ui.HScrollBar;
	improt laya.events.Event;
	public class TextArea extends laya.ui.TextInput {
		protected var _vScrollBar:VScrollBar;
		protected var _hScrollBar:HScrollBar;

		public function TextArea(text:String = null){}
		private var _onTextChange:*;
		public function destroy(destroyChild:Boolean = null):void{}
		protected function initialize():void{}
		public var width:Number;
		public var height:Number;
		public var vScrollBarSkin:String;
		public var hScrollBarSkin:String;
		protected function onVBarChanged(e:Event):void{}
		protected function onHBarChanged(e:Event):void{}
		public function get vScrollBar():VScrollBar{};
		public function get hScrollBar():HScrollBar{};
		public function get maxScrollY():Number{};
		public function get scrollY():Number{};
		public function get maxScrollX():Number{};
		public function get scrollX():Number{};
		private var changeScroll:*;
		public function scrollTo(y:Number):void{}
	}

}
