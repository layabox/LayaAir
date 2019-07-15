/*[IF-FLASH]*/
package laya.d3.math.Native {
	improt laya.d3.math.Native.ConchVector4;
	improt laya.d3.math.Native.ConchQuaternion;
	improt laya.d3.core.IClone;
	public class ConchVector3 implements laya.d3.core.IClone {
		public static var ZERO:ConchVector3;
		public static var ONE:ConchVector3;
		public static var NegativeUnitX:ConchVector3;
		public static var UnitX:ConchVector3;
		public static var UnitY:ConchVector3;
		public static var UnitZ:ConchVector3;
		public static var ForwardRH:ConchVector3;
		public static var ForwardLH:ConchVector3;
		public static var Up:ConchVector3;
		public static var NAN:ConchVector3;
		public var elements:Float32Array;
		public static function distanceSquared(value1:ConchVector3,value2:ConchVector3):Number{}
		public static function distance(value1:ConchVector3,value2:ConchVector3):Number{}
		public static function min(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}
		public static function max(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}
		public static function transformQuat(source:ConchVector3,rotation:ConchQuaternion,out:ConchVector3):void{}
		public static function scalarLength(a:ConchVector3):Number{}
		public static function scalarLengthSquared(a:ConchVector3):Number{}
		public static function normalize(s:ConchVector3,out:ConchVector3):void{}
		public static function multiply(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}
		public static function scale(a:ConchVector3,b:Number,out:ConchVector3):void{}
		public static function lerp(a:ConchVector3,b:ConchVector3,t:Number,out:ConchVector3):void{}
		public static function transformV3ToV3(vector:ConchVector3,transform:*,result:ConchVector3):void{}
		public static function transformV3ToV4(vector:ConchVector3,transform:*,result:ConchVector4):void{}
		public static function TransformNormal(normal:ConchVector3,transform:*,result:ConchVector3):void{}
		public static function transformCoordinate(coordinate:ConchVector3,transform:*,result:ConchVector3):void{}
		public static function Clamp(value:ConchVector3,min:ConchVector3,max:ConchVector3,out:ConchVector3):void{}
		public static function add(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}
		public static function subtract(a:ConchVector3,b:ConchVector3,o:ConchVector3):void{}
		public static function cross(a:ConchVector3,b:ConchVector3,o:ConchVector3):void{}
		public static function dot(a:ConchVector3,b:ConchVector3):Number{}
		public static function equals(a:ConchVector3,b:ConchVector3):Boolean{}
		public var x:Number;
		public var y:Number;
		public var z:Number;

		public function ConchVector3(x:Number = null,y:Number = null,z:Number = null,nativeElements:Float32Array = null){}
		public function setValue(x:Number,y:Number,z:Number):void{}
		public function fromArray(array:Array,offset:Number = null):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function toDefault():void{}
	}

}
