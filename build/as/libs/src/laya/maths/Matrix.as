/*[IF-FLASH]*/
package laya.maths {
	improt laya.maths.Point;
	public class Matrix {
		public static var EMPTY:Matrix;
		public static var TEMP:Matrix;
		public static var _createFun:Function;
		public var a:Number;
		public var b:Number;
		public var c:Number;
		public var d:Number;
		public var tx:Number;
		public var ty:Number;

		public function Matrix(a:Number = null,b:Number = null,c:Number = null,d:Number = null,tx:Number = null,ty:Number = null,nums:Number = null){}
		public function identity():Matrix{}
		public function setTranslate(x:Number,y:Number):Matrix{}
		public function translate(x:Number,y:Number):Matrix{}
		public function scale(x:Number,y:Number):Matrix{}
		public function rotate(angle:Number):Matrix{}
		public function skew(x:Number,y:Number):Matrix{}
		public function invertTransformPoint(out:Point):Point{}
		public function transformPoint(out:Point):Point{}
		public function transformPointN(out:Point):Point{}
		public function getScaleX():Number{}
		public function getScaleY():Number{}
		public function invert():Matrix{}
		public function setTo(a:Number,b:Number,c:Number,d:Number,tx:Number,ty:Number):Matrix{}
		public function concat(matrix:Matrix):Matrix{}
		public static function mul(m1:Matrix,m2:Matrix,out:Matrix):Matrix{}
		public static function mul16(m1:Matrix,m2:Matrix,out:Array):Array{}
		public function scaleEx(x:Number,y:Number):void{}
		public function rotateEx(angle:Number):void{}
		public function clone():Matrix{}
		public function copyTo(dec:Matrix):Matrix{}
		public function toString():String{}
		public function destroy():void{}
		public function recover():void{}
		public static function create():Matrix{}
	}

}
