/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Vector2;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.core.IClone;
	public class Matrix3x3 implements laya.d3.core.IClone {
		public static var DEFAULT:Matrix3x3;
		public static function createFromTranslation(trans:Vector2,out:Matrix3x3):void{}
		public static function createFromRotation(rad:Number,out:Matrix3x3):void{}
		public static function createFromScaling(scale:Vector2,out:Matrix3x3):void{}
		public static function createFromMatrix4x4(sou:Matrix4x4,out:Matrix3x3):void{}
		public static function multiply(left:Matrix3x3,right:Matrix3x3,out:Matrix3x3):void{}
		public var elements:Float32Array;

		public function Matrix3x3(){}
		public function determinant():Number{}
		public function translate(trans:Vector2,out:Matrix3x3):void{}
		public function rotate(rad:Number,out:Matrix3x3):void{}
		public function scale(scale:Vector2,out:Matrix3x3):void{}
		public function invert(out:Matrix3x3):void{}
		public function transpose(out:Matrix3x3):void{}
		public function identity():void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public static function lookAt(eye:Vector3,target:Vector3,up:Vector3,out:Matrix3x3):void{}
	}

}
