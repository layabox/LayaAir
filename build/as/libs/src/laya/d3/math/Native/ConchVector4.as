/*[IF-FLASH]*/
package laya.d3.math.Native {
	improt laya.d3.core.IClone;
	public class ConchVector4 implements laya.d3.core.IClone {
		public static var ZERO:ConchVector4;
		public static var ONE:ConchVector4;
		public static var UnitX:ConchVector4;
		public static var UnitY:ConchVector4;
		public static var UnitZ:ConchVector4;
		public static var UnitW:ConchVector4;
		public var elements:Float32Array;
		public var x:Number;
		public var y:Number;
		public var z:Number;
		public var w:Number;

		public function ConchVector4(x:Number = null,y:Number = null,z:Number = null,w:Number = null){}
		public function fromArray(array:Array,offset:Number = null):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public static function lerp(a:ConchVector4,b:ConchVector4,t:Number,out:ConchVector4):void{}
		public static function transformByM4x4(vector4:ConchVector4,m4x4:*,out:ConchVector4):void{}
		public static function equals(a:ConchVector4,b:ConchVector4):Boolean{}
		public function length():Number{}
		public function lengthSquared():Number{}
		public static function normalize(s:ConchVector4,out:ConchVector4):void{}
		public static function add(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}
		public static function subtract(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}
		public static function multiply(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}
		public static function scale(a:ConchVector4,b:Number,out:ConchVector4):void{}
		public static function Clamp(value:ConchVector4,min:ConchVector4,max:ConchVector4,out:ConchVector4):void{}
		public static function distanceSquared(value1:ConchVector4,value2:ConchVector4):Number{}
		public static function distance(value1:ConchVector4,value2:ConchVector4):Number{}
		public static function dot(a:ConchVector4,b:ConchVector4):Number{}
		public static function min(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}
		public static function max(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}
	}

}
