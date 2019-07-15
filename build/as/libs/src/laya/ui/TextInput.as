/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Label;
	improt laya.ui.AutoBitmap;
	public class TextInput extends laya.ui.Label {
		protected var _bg:AutoBitmap;
		protected var _skin:String;

		public function TextInput(text:String = null){}
		protected function preinitialize():void{}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		private var _onFocus:*;
		private var _onBlur:*;
		private var _onInput:*;
		private var _onEnter:*;
		protected function initialize():void{}
		public var bg:AutoBitmap;
		public var skin:String;
		protected function _skinLoaded():void{}
		public var sizeGrid:String;
		public var text:String;
		public var width:Number;
		public var height:Number;
		public var multiline:Boolean;
		public var editable:Boolean;
		public function select():void{}
		public var restrict:String;
		public var prompt:String;
		public var promptColor:String;
		public var maxChars:Number;
		public var focus:Boolean;
		public var type:String;
		public function setSelection(startIndex:Number,endIndex:Number):void{}
	}

}
