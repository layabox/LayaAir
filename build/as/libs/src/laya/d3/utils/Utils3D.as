/*[IF-FLASH]*/
package laya.d3.utils {
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Vector3;
	public class Utils3D {
		private static var _tempVector3_0:*;
		private static var _tempVector3_1:*;
		private static var _tempVector3_2:*;
		private static var _tempColor0:*;
		private static var _tempArray16_0:*;
		private static var _tempArray16_1:*;
		private static var _tempArray16_2:*;
		private static var _tempArray16_3:*;
		private static var _rotationTransformScaleSkinAnimation:*;
		public static function transformVector3ArrayByQuat(sourceArray:Float32Array,sourceOffset:Number,rotation:Quaternion,outArray:Float32Array,outOffset:Number):void{}
		public static function mulMatrixByArray(leftArray:Float32Array,leftOffset:Number,rightArray:Float32Array,rightOffset:Number,outArray:Float32Array,outOffset:Number):void{}
		public static function mulMatrixByArrayFast(leftArray:Float32Array,leftOffset:Number,rightArray:Float32Array,rightOffset:Number,outArray:Float32Array,outOffset:Number):void{}
		public static function mulMatrixByArrayAndMatrixFast(leftArray:Float32Array,leftOffset:Number,rightMatrix:Matrix4x4,outArray:Float32Array,outOffset:Number):void{}
		public static function createAffineTransformationArray(tX:Number,tY:Number,tZ:Number,rX:Number,rY:Number,rZ:Number,rW:Number,sX:Number,sY:Number,sZ:Number,outArray:Float32Array,outOffset:Number):void{}
		public static function transformVector3ArrayToVector3ArrayCoordinate(source:Float32Array,sourceOffset:Number,transform:Matrix4x4,result:Float32Array,resultOffset:Number):void{}
		public static function getURLVerion(url:String):String{}
		private static var arcTanAngle:*;
		private static var angleTo:*;
		public static function transformQuat(source:Vector3,rotation:Float32Array,out:Vector3):void{}
		public static function quaternionWeight(f:Quaternion,weight:Number,e:Quaternion):void{}
		public static function matrix4x4MultiplyFFF(a:Float32Array,b:Float32Array,e:Float32Array):void{}
		public static function matrix4x4MultiplyFFFForNative(a:Float32Array,b:Float32Array,e:Float32Array):void{}
		public static function matrix4x4MultiplyMFM(left:Matrix4x4,right:Float32Array,out:Matrix4x4):void{}
	}

}
