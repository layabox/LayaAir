/*[IF-FLASH]*/
package laya.utils {
	public class HTMLChar {
		private static var _isWordRegExp:*;
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public var isWord:Boolean;
		public var char:String;
		public var charNum:Number;
		public var style:*;

		public function HTMLChar(){}
		public function setData(char:String,w:Number,h:Number,style:*):HTMLChar{}
		public function reset():HTMLChar{}
		public function recover():void{}
		public static function create():HTMLChar{}
	}

}
