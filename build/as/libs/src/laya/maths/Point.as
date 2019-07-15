/*[IF-FLASH]*/
package laya.maths {
	public class Point {
		public static var TEMP:Point;
		public static var EMPTY:Point;
		public var x:Number;
		public var y:Number;

		public function Point(x:Number = null,y:Number = null){}
		public static function create():Point{}
		public function setTo(x:Number,y:Number):Point{}
		public function reset():Point{}
		public function recover():void{}
		public function distance(x:Number,y:Number):Number{}
		public function toString():String{}
		public function normalize():void{}
		public function copy(point:Point):Point{}
	}

}
