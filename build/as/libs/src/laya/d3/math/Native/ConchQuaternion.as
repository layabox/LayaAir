/*[IF-FLASH]*/
package laya.d3.math.Native {
	improt laya.d3.math.Native.ConchVector3;
	improt laya.d3.core.IClone;
	improt laya.d3.math.Matrix3x3;
	improt laya.d3.math.Matrix4x4;
	public class ConchQuaternion implements laya.d3.core.IClone {
		public static var DEFAULT:ConchQuaternion;
		public static var NAN:ConchQuaternion;
		public static function createFromYawPitchRoll(yaw:Number,pitch:Number,roll:Number,out:ConchQuaternion):void{}
		public static function multiply(left:ConchQuaternion,right:ConchQuaternion,out:ConchQuaternion):void{}
		private static var arcTanAngle:*;
		private static var angleTo:*;
		public static function createFromAxisAngle(axis:ConchVector3,rad:Number,out:ConchQuaternion):void{}
		public static function createFromMatrix3x3(sou:Matrix3x3,out:ConchQuaternion):void{}
		public static function createFromMatrix4x4(mat:Matrix4x4,out:ConchQuaternion):void{}
		public static function slerp(left:ConchQuaternion,right:ConchQuaternion,t:Number,out:ConchQuaternion):Float32Array{}
		public static function lerp(left:ConchQuaternion,right:ConchQuaternion,amount:Number,out:ConchQuaternion):void{}
		public static function add(left:*,right:ConchQuaternion,out:ConchQuaternion):void{}
		public static function dot(left:*,right:ConchQuaternion):Number{}
		public var elements:Float32Array;
		public var x:Number;
		public var y:Number;
		public var z:Number;
		public var w:Number;

		public function ConchQuaternion(x:Number = null,y:Number = null,z:Number = null,w:Number = null,nativeElements:Float32Array = null){}
		public function scaling(scaling:Number,out:ConchQuaternion):void{}
		public function normalize(out:ConchQuaternion):void{}
		public function length():Number{}
		public function rotateX(rad:Number,out:ConchQuaternion):void{}
		public function rotateY(rad:Number,out:ConchQuaternion):void{}
		public function rotateZ(rad:Number,out:ConchQuaternion):void{}
		public function getYawPitchRoll(out:ConchVector3):void{}
		public function invert(out:ConchQuaternion):void{}
		public function identity():void{}
		public function fromArray(array:Array,offset:Number = null):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function equals(b:ConchQuaternion):Boolean{}
		public static function rotationLookAt(forward:ConchVector3,up:ConchVector3,out:ConchQuaternion):void{}
		public static function lookAt(eye:*,target:*,up:*,out:ConchQuaternion):void{}
		public function lengthSquared():Number{}
		public static function invert(value:ConchQuaternion,out:ConchQuaternion):void{}
		public static function rotationMatrix(matrix3x3:Matrix3x3,out:ConchQuaternion):void{}
	}

}
