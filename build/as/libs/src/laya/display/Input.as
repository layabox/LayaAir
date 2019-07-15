/*[IF-FLASH]*/
package laya.display {
	improt laya.display.Text;
	public class Input extends laya.display.Text {
		public static var TYPE_TEXT:String;
		public static var TYPE_PASSWORD:String;
		public static var TYPE_EMAIL:String;
		public static var TYPE_URL:String;
		public static var TYPE_NUMBER:String;
		public static var TYPE_RANGE:String;
		public static var TYPE_DATE:String;
		public static var TYPE_MONTH:String;
		public static var TYPE_WEEK:String;
		public static var TYPE_TIME:String;
		public static var TYPE_DATE_TIME:String;
		public static var TYPE_DATE_TIME_LOCAL:String;
		public static var TYPE_SEARCH:String;
		protected static var input:*;
		protected static var area:*;
		protected static var inputElement:*;
		protected static var inputContainer:*;
		protected static var confirmButton:*;
		protected static var promptStyleDOM:*;
		protected var _focus:Boolean;
		protected var _multiline:Boolean;
		protected var _editable:Boolean;
		protected var _restrictPattern:*;
		protected var _maxChars:Number;
		private var _type:*;
		private var _prompt:*;
		private var _promptColor:*;
		private var _originColor:*;
		private var _content:*;
		public static var IOS_IFRAME:Boolean;
		private static var inputHeight:*;
		public static var isInputting:Boolean;

		public function Input(){}
		public static function __init__():void{}
		private static var _popupInputMethod:*;
		private static var _createInputElement:*;
		private static var _initInput:*;
		private static var _processInputting:*;
		private static var _stopEvent:*;
		public function setSelection(startIndex:Number,endIndex:Number):void{}
		public var multiline:Boolean;
		public function get nativeInput():*{};
		private var _onUnDisplay:*;
		private var _onMouseDown:*;
		private static var stageMatrix:*;
		private var _syncInputTransform:*;
		public function select():void{}
		public var focus:Boolean;
		private var _setInputMethod:*;
		private var _focusIn:*;
		private var _setPromptColor:*;
		private var _focusOut:*;
		private var _onKeyDown:*;
		public var text:String;
		public function changeText(text:String):void{}
		public var color:String;
		public var bgColor:String;
		public var restrict:String;
		public var editable:Boolean;
		public var maxChars:Number;
		public var prompt:String;
		public var promptColor:String;
		public var type:String;
	}

}
