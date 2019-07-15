/*[IF-FLASH]*/
package laya.utils {
	public class WordText {
		public var id:Number;
		public var save:Array;
		public var toUpperCase:String;
		public var changed:Boolean;
		public var width:Number;
		public var pageChars:Array;
		public var startID:Number;
		public var startIDStroke:Number;
		public var lastGCCnt:Number;
		public var splitRender:Boolean;
		public function setText(txt:String):void{}
		public function toString():String{}
		public function get length():Number{};
		public function charCodeAt(i:Number):Number{}
		public function charAt(i:Number):String{}
		public function cleanCache():void{}
	}

}
