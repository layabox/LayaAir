/*[IF-FLASH]*/
package laya.maths {
	public class Rectangle {
		public static var EMPTY:Rectangle;
		public static var TEMP:Rectangle;
		private static var _temB:*;
		private static var _temA:*;
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;

		public function Rectangle(x:Number = null,y:Number = null,width:Number = null,height:Number = null){}
		public function get right():Number{};
		public function get bottom():Number{};
		public function setTo(x:Number,y:Number,width:Number,height:Number):Rectangle{}
		public function reset():Rectangle{}
		public function recover():void{}
		public static function create():Rectangle{}
		public function copyFrom(source:Rectangle):Rectangle{}
		public function contains(x:Number,y:Number):Boolean{}
		public function intersects(rect:Rectangle):Boolean{}
		public function intersection(rect:Rectangle,out:Rectangle = null):Rectangle{}
		public function union(source:Rectangle,out:Rectangle = null):Rectangle{}
		public function clone(out:Rectangle = null):Rectangle{}
		public function toString():String{}
		public function equals(rect:Rectangle):Boolean{}
		public function addPoint(x:Number,y:Number):Rectangle{}
		public function isEmpty():Boolean{}
	}

}
