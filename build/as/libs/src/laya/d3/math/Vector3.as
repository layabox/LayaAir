/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector4;
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.core.IClone;
	public class Vector3 implements laya.d3.core.IClone {
		public static function distanceSquared(value1:Vector3,value2:Vector3):Number{}
		public static function distance(value1:Vector3,value2:Vector3):Number{}
		public static function min(a:Vector3,b:Vector3,out:Vector3):void{}
		public static function max(a:Vector3,b:Vector3,out:Vector3):void{}
		public static function transformQuat(source:Vector3,rotation:Quaternion,out:Vector3):void{}
		public static function scalarLength(a:Vector3):Number{}
		public static function scalarLengthSquared(a:Vector3):Number{}
		public static function normalize(s:Vector3,out:Vector3):void{}
		public static function multiply(a:Vector3,b:Vector3,out:Vector3):void{}
		public static function scale(a:Vector3,b:Number,out:Vector3):void{}
		public static function lerp(a:Vector3,b:Vector3,t:Number,out:Vector3):void{}
		public static function transformV3ToV3(vector:Vector3,transform:Matrix4x4,result:Vector3):void{}
		public static function transformV3ToV4(vector:Vector3,transform:Matrix4x4,result:Vector4):void{}
		public static function TransformNormal(normal:Vector3,transform:Matrix4x4,result:Vector3):void{}
		public static function transformCoordinate(coordinate:Vector3,transform:Matrix4x4,result:Vector3):void{}
		public static function Clamp(value:Vector3,min:Vector3,max:Vector3,out:Vector3):void{}
		public static function add(a:Vector3,b:Vector3,out:Vector3):void{}
		public static function subtract(a:Vector3,b:Vector3,o:Vector3):void{}
		public static function cross(a:Vector3,b:Vector3,o:Vector3):void{}
		public static function dot(a:Vector3,b:Vector3):Number{}
		public static function equals(a:Vector3,b:Vector3):Boolean{}
		public var x:Number;
		public var y:Number;
		public var z:Number;

		public function Vector3(x:Number = null,y:Number = null,z:Number = null,nativeElements:Float32Array = null){}
		public function setValue(x:Number,y:Number,z:Number):void{}
		public function fromArray(array:Array,offset:Number = null):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function toDefault():void{}
		public function forNativeElement(nativeElements:Float32Array = null):void{}
	}

}
