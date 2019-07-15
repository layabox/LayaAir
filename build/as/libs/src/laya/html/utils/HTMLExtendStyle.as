/*[IF-FLASH]*/
package laya.html.utils {
	public class HTMLExtendStyle {
		public static var EMPTY:HTMLExtendStyle;
		public var stroke:Number;
		public var strokeColor:String;
		public var leading:Number;
		public var lineHeight:Number;
		public var letterSpacing:Number;
		public var href:String;

		public function HTMLExtendStyle(){}
		public function reset():HTMLExtendStyle{}
		public function recover():void{}
		public static function create():HTMLExtendStyle{}
	}

}
