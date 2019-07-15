/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Quaternion;
	improt laya.d3.core.IClone;
	public class Matrix4x4 implements laya.d3.core.IClone {
		public static var DEFAULT:Matrix4x4;
		public static var ZERO:Matrix4x4;
		public static function createRotationX(rad:Number,out:Matrix4x4):void{}
		public static function createRotationY(rad:Number,out:Matrix4x4):void{}
		public static function createRotationZ(rad:Number,out:Matrix4x4):void{}
		public static function createRotationYawPitchRoll(yaw:Number,pitch:Number,roll:Number,result:Matrix4x4):void{}
		public static function createRotationAxis(axis:Vector3,angle:Number,result:Matrix4x4):void{}
		public function setRotation(rotation:Quaternion):void{}
		public function setPosition(position:Vector3):void{}
		public static function createRotationQuaternion(rotation:Quaternion,result:Matrix4x4):void{}
		public static function createTranslate(trans:Vector3,out:Matrix4x4):void{}
		public static function createScaling(scale:Vector3,out:Matrix4x4):void{}
		public static function multiply(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void{}
		public static function multiplyForNative(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void{}
		public static function createFromQuaternion(rotation:Quaternion,out:Matrix4x4):void{}
		public static function createAffineTransformation(trans:Vector3,rot:Quaternion,scale:Vector3,out:Matrix4x4):void{}
		public static function createLookAt(eye:Vector3,target:Vector3,up:Vector3,out:Matrix4x4):void{}
		public static function createPerspective(fov:Number,aspect:Number,znear:Number,zfar:Number,out:Matrix4x4):void{}
		public static function createPerspectiveOffCenter(left:Number,right:Number,bottom:Number,top:Number,znear:Number,zfar:Number,out:Matrix4x4):void{}
		public static function createOrthoOffCenter(left:Number,right:Number,bottom:Number,top:Number,znear:Number,zfar:Number,out:Matrix4x4):void{}
		public var elements:Float32Array;

		public function Matrix4x4(m11:Number = null,m12:Number = null,m13:Number = null,m14:Number = null,m21:Number = null,m22:Number = null,m23:Number = null,m24:Number = null,m31:Number = null,m32:Number = null,m33:Number = null,m34:Number = null,m41:Number = null,m42:Number = null,m43:Number = null,m44:Number = null,elements:Float32Array = null){}
		public function getElementByRowColumn(row:Number,column:Number):Number{}
		public function setElementByRowColumn(row:Number,column:Number,value:Number):void{}
		public function equalsOtherMatrix(other:Matrix4x4):Boolean{}
		public function decomposeTransRotScale(translation:Vector3,rotation:Quaternion,scale:Vector3):Boolean{}
		public function decomposeTransRotMatScale(translation:Vector3,rotationMatrix:Matrix4x4,scale:Vector3):Boolean{}
		public function decomposeYawPitchRoll(yawPitchRoll:Vector3):void{}
		public function normalize():void{}
		public function transpose():Matrix4x4{}
		public function invert(out:Matrix4x4):void{}
		public static function billboard(objectPosition:Vector3,cameraPosition:Vector3,cameraRight:Vector3,cameraUp:Vector3,cameraForward:Vector3,mat:Matrix4x4):void{}
		public function identity():void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public static function translation(v3:Vector3,out:Matrix4x4):void{}
		public function getTranslationVector(out:Vector3):void{}
		public function setTranslationVector(translate:Vector3):void{}
		public function getForward(out:Vector3):void{}
		public function setForward(forward:Vector3):void{}
	}

}
