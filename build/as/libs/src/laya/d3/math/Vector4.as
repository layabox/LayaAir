/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.core.IClone;
	public class Vector4 implements laya.d3.core.IClone {
		public static var ZERO:Vector4;
		public static var ONE:Vector4;
		public static var UnitX:Vector4;
		public static var UnitY:Vector4;
		public static var UnitZ:Vector4;
		public static var UnitW:Vector4;
		public var x:Number;
		public var y:Number;
		public var z:Number;
		public var w:Number;

		public function Vector4(x:Number = null,y:Number = null,z:Number = null,w:Number = null){}
		public function setValue(x:Number,y:Number,z:Number,w:Number):void{}
		public function fromArray(array:Array,offset:Number = null):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public static function lerp(a:Vector4,b:Vector4,t:Number,out:Vector4):void{}
		public static function transformByM4x4(vector4:Vector4,m4x4:Matrix4x4,out:Vector4):void{}
		public static function equals(a:Vector4,b:Vector4):Boolean{}
		public function length():Number{}
		public function lengthSquared():Number{}
		public static function normalize(s:Vector4,out:Vector4):void{}
		public static function add(a:Vector4,b:Vector4,out:Vector4):void{}
		public static function subtract(a:Vector4,b:Vector4,out:Vector4):void{}
		public static function multiply(a:Vector4,b:Vector4,out:Vector4):void{}
		public static function scale(a:Vector4,b:Number,out:Vector4):void{}
		public static function Clamp(value:Vector4,min:Vector4,max:Vector4,out:Vector4):void{}
		public static function distanceSquared(value1:Vector4,value2:Vector4):Number{}
		public static function distance(value1:Vector4,value2:Vector4):Number{}
		public static function dot(a:Vector4,b:Vector4):Number{}
		public static function min(a:Vector4,b:Vector4,out:Vector4):void{}
		public static function max(a:Vector4,b:Vector4,out:Vector4):void{}
		public function forNativeElement(nativeElements:Float32Array = null):void{}
	}

}
