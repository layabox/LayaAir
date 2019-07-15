/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Matrix3x3;
	improt laya.d3.core.IClone;
	public class Quaternion implements laya.d3.core.IClone {
		public static var DEFAULT:Quaternion;
		public static var NAN:Quaternion;
		public static function createFromYawPitchRoll(yaw:Number,pitch:Number,roll:Number,out:Quaternion):void{}
		public static function multiply(left:Quaternion,right:Quaternion,out:Quaternion):void{}
		private static var arcTanAngle:*;
		private static var angleTo:*;
		public static function createFromAxisAngle(axis:Vector3,rad:Number,out:Quaternion):void{}
		public static function createFromMatrix4x4(mat:Matrix4x4,out:Quaternion):void{}
		public static function slerp(left:Quaternion,right:Quaternion,t:Number,out:Quaternion):Quaternion{}
		public static function lerp(left:Quaternion,right:Quaternion,amount:Number,out:Quaternion):void{}
		public static function add(left:Quaternion,right:Quaternion,out:Quaternion):void{}
		public static function dot(left:Quaternion,right:Quaternion):Number{}
		public var x:Number;
		public var y:Number;
		public var z:Number;
		public var w:Number;

		public function Quaternion(x:Number = null,y:Number = null,z:Number = null,w:Number = null,nativeElements:Float32Array = null){}
		public function scaling(scaling:Number,out:Quaternion):void{}
		public function normalize(out:Quaternion):void{}
		public function length():Number{}
		public function rotateX(rad:Number,out:Quaternion):void{}
		public function rotateY(rad:Number,out:Quaternion):void{}
		public function rotateZ(rad:Number,out:Quaternion):void{}
		public function getYawPitchRoll(out:Vector3):void{}
		public function invert(out:Quaternion):void{}
		public function identity():void{}
		public function fromArray(array:Array,offset:Number = null):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function equals(b:Quaternion):Boolean{}
		public static function rotationLookAt(forward:Vector3,up:Vector3,out:Quaternion):void{}
		public static function lookAt(eye:Vector3,target:Vector3,up:Vector3,out:Quaternion):void{}
		public function lengthSquared():Number{}
		public static function invert(value:Quaternion,out:Quaternion):void{}
		public static function rotationMatrix(matrix3x3:Matrix3x3,out:Quaternion):void{}
		public function forNativeElement(nativeElements:Float32Array = null):void{}
	}

}
