/*[IF-FLASH]*/
package laya.html.utils {
	improt laya.html.dom.HTMLElement;
	public class HTMLStyle {
		private static var _CSSTOVALUE:*;
		private static var _parseCSSRegExp:*;
		private static var _inheritProps:*;
		public static var ALIGN_LEFT:String;
		public static var ALIGN_CENTER:String;
		public static var ALIGN_RIGHT:String;
		public static var VALIGN_TOP:String;
		public static var VALIGN_MIDDLE:String;
		public static var VALIGN_BOTTOM:String;
		public static var styleSheets:*;
		public static var ADDLAYOUTED:Number;
		private static var _PADDING:*;
		protected static var _HEIGHT_SET:Number;
		protected static var _LINE_ELEMENT:Number;
		protected static var _NOWARP:Number;
		protected static var _WIDTHAUTO:Number;
		protected static var _BOLD:Number;
		protected static var _ITALIC:Number;
		protected static var _CSS_BLOCK:Number;
		protected static var _DISPLAY_NONE:Number;
		protected static var _ABSOLUTE:Number;
		protected static var _WIDTH_SET:Number;
		protected static var alignVDic:*;
		protected static var align_Value:*;
		protected static var vAlign_Value:*;
		protected static var _ALIGN:Number;
		protected static var _VALIGN:Number;
		public var fontSize:Number;
		public var family:String;
		public var color:String;
		public var ower:HTMLElement;
		private var _extendStyle:*;
		public var textDecoration:String;
		public var bgColor:String;
		public var borderColor:String;
		public var padding:Array;

		public function HTMLStyle(){}
		private var _getExtendStyle:*;
		public var href:String;
		public var stroke:Number;
		public var strokeColor:String;
		public var leading:Number;
		public var lineHeight:Number;
		public var align:String;
		public var valign:String;
		public var font:String;
		public var block:Boolean;
		public function reset():HTMLStyle{}
		public function recover():void{}
		public static function create():HTMLStyle{}
		public function inherit(src:HTMLStyle):void{}
		public var wordWrap:Boolean;
		public var bold:Boolean;
		public var italic:Boolean;
		public function widthed(sprite:*):Boolean{}
		public var whiteSpace:String;
		public var width:*;
		public var height:*;
		public function heighted(sprite:*):Boolean{}
		public function size(w:Number,h:Number):void{}
		public function getLineElement():Boolean{}
		public function setLineElement(value:Boolean):void{}
		public var letterSpacing:Number;
		public function cssText(text:String):void{}
		public function attrs(attrs:Array):void{}
		public var position:String;
		public function get absolute():Boolean{};
		public function get paddingLeft():Number{};
		public function get paddingTop():Number{};
		public static function parseOneCSS(text:String,clipWord:String):Array{}
	}

}
