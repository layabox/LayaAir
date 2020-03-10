package laya.d3.utils {
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Quaternion;
	import laya.d3.math.Vector3;

	/**
	 * <code>Utils3D</code> 类用于创建3D工具。
	 */
	public class Utils3D {
		private static var _tempVector3_0:*;
		private static var _tempVector3_1:*;
		private static var _tempArray16_0:*;
		private static var _tempArray16_1:*;
		private static var _tempArray16_2:*;
		private static var _tempArray16_3:*;

		/**
		 * 通过数平移、旋转、缩放值计算到结果矩阵数组,骨骼动画专用。
		 * @param tx left矩阵数组。
		 * @param ty left矩阵数组的偏移。
		 * @param tz right矩阵数组。
		 * @param qx right矩阵数组的偏移。
		 * @param qy 输出矩阵数组。
		 * @param qz 输出矩阵数组的偏移。
		 * @param qw 输出矩阵数组的偏移。
		 * @param sx 输出矩阵数组的偏移。
		 * @param sy 输出矩阵数组的偏移。
		 * @param sz 输出矩阵数组的偏移。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		private static var _rotationTransformScaleSkinAnimation:*;

		/**
		 * 根据四元数旋转三维向量。
		 * @param source 源三维向量。
		 * @param rotation 旋转四元数。
		 * @param out 输出三维向量。
		 */
		public static function transformVector3ArrayByQuat(sourceArray:Float32Array,sourceOffset:Number,rotation:Quaternion,outArray:Float32Array,outOffset:Number):void{}

		/**
		 * 通过数组数据计算矩阵乘法。
		 * @param leftArray left矩阵数组。
		 * @param leftOffset left矩阵数组的偏移。
		 * @param rightArray right矩阵数组。
		 * @param rightOffset right矩阵数组的偏移。
		 * @param outArray 输出矩阵数组。
		 * @param outOffset 输出矩阵数组的偏移。
		 */
		public static function mulMatrixByArray(leftArray:Float32Array,leftOffset:Number,rightArray:Float32Array,rightOffset:Number,outArray:Float32Array,outOffset:Number):void{}

		/**
		 * 通过数组数据计算矩阵乘法,rightArray和outArray不能为同一数组引用。
		 * @param leftArray left矩阵数组。
		 * @param leftOffset left矩阵数组的偏移。
		 * @param rightArray right矩阵数组。
		 * @param rightOffset right矩阵数组的偏移。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		public static function mulMatrixByArrayFast(leftArray:Float32Array,leftOffset:Number,rightArray:Float32Array,rightOffset:Number,outArray:Float32Array,outOffset:Number):void{}

		/**
		 * 通过数组数据计算矩阵乘法,rightArray和outArray不能为同一数组引用。
		 * @param leftArray left矩阵数组。
		 * @param leftOffset left矩阵数组的偏移。
		 * @param rightMatrix right矩阵。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		public static function mulMatrixByArrayAndMatrixFast(leftArray:Float32Array,leftOffset:Number,rightMatrix:Matrix4x4,outArray:Float32Array,outOffset:Number):void{}

		/**
		 * 通过数平移、旋转、缩放值计算到结果矩阵数组。
		 * @param tX left矩阵数组。
		 * @param tY left矩阵数组的偏移。
		 * @param tZ right矩阵数组。
		 * @param qX right矩阵数组的偏移。
		 * @param qY 输出矩阵数组。
		 * @param qZ 输出矩阵数组的偏移。
		 * @param qW 输出矩阵数组的偏移。
		 * @param sX 输出矩阵数组的偏移。
		 * @param sY 输出矩阵数组的偏移。
		 * @param sZ 输出矩阵数组的偏移。
		 * @param outArray 结果矩阵数组。
		 * @param outOffset 结果矩阵数组的偏移。
		 */
		public static function createAffineTransformationArray(tX:Number,tY:Number,tZ:Number,rX:Number,rY:Number,rZ:Number,rW:Number,sX:Number,sY:Number,sZ:Number,outArray:Float32Array,outOffset:Number):void{}

		/**
		 * 通过矩阵转换一个三维向量数组到另外一个归一化的三维向量数组。
		 * @param source 源三维向量所在数组。
		 * @param sourceOffset 源三维向量数组偏移。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量所在数组。
		 * @param resultOffset 输出三维向量数组偏移。
		 */
		public static function transformVector3ArrayToVector3ArrayCoordinate(source:Float32Array,sourceOffset:Number,transform:Matrix4x4,result:Float32Array,resultOffset:Number):void{}
		public static function transformVector3ArrayToVector3ArrayNormal(source:Float32Array,sourceOffset:Number,transform:Matrix4x4,result:Float32Array,resultOffset:Number):void{}

		/**
		 * 获取URL版本字符。
		 * @param url 
		 * @return 
		 */
		public static function getURLVerion(url:String):String{
			return null;
		}
		private static var arcTanAngle:*;
		private static var angleTo:*;
		public static function transformQuat(source:Vector3,rotation:Float32Array,out:Vector3):void{}
		public static function quaternionWeight(f:Quaternion,weight:Number,e:Quaternion):void{}
		public static function matrix4x4MultiplyFFF(a:Float32Array,b:Float32Array,e:Float32Array):void{}
		public static function matrix4x4MultiplyFFFForNative(a:Float32Array,b:Float32Array,e:Float32Array):void{}
		public static function matrix4x4MultiplyMFM(left:Matrix4x4,right:Float32Array,out:Matrix4x4):void{}
	}

}
