package laya.d3.math {
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector2;
	import laya.d3.math.Matrix4x4;
	import laya.d3.core.IClone;
	import laya.d3.math.Quaternion;

	/**
	 * <code>Matrix3x3</code> 类用于创建3x3矩阵。
	 */
	public class Matrix3x3 implements IClone {

		/**
		 * 默认矩阵,禁止修改
		 */
		public static var DEFAULT:Matrix3x3;

		/**
		 * 通过四元数创建旋转矩阵。
		 * @param rotation 旋转四元数。
		 * @param out 旋转矩阵。
		 */
		public static function createRotationQuaternion(rotation:Quaternion,out:Matrix3x3):void{}

		/**
		 * 根据指定平移生成3x3矩阵
		 * @param tra 平移
		 * @param out 输出矩阵
		 */
		public static function createFromTranslation(trans:Vector2,out:Matrix3x3):void{}

		/**
		 * 根据指定旋转生成3x3矩阵
		 * @param rad 旋转值
		 * @param out 输出矩阵
		 */
		public static function createFromRotation(rad:Number,out:Matrix3x3):void{}

		/**
		 * 根据制定缩放生成3x3矩阵
		 * @param scale 缩放值
		 * @param out 输出矩阵
		 */
		public static function createFromScaling(scale:Vector3,out:Matrix3x3):void{}

		/**
		 * 从4x4矩阵转换为一个3x3的矩阵（原则为upper-left,忽略第四行四列）
		 * @param sou 4x4源矩阵
		 * @param out 3x3输出矩阵
		 */
		public static function createFromMatrix4x4(sou:Matrix4x4,out:Matrix3x3):void{}

		/**
		 * 两个3x3矩阵的相乘
		 * @param left 左矩阵
		 * @param right 右矩阵
		 * @param out 输出矩阵
		 */
		public static function multiply(left:Matrix3x3,right:Matrix3x3,out:Matrix3x3):void{}

		/**
		 * 矩阵元素数组
		 */
		public var elements:Float32Array;

		/**
		 * 创建一个 <code>Matrix3x3</code> 实例。
		 */

		public function Matrix3x3(){}

		/**
		 * 计算3x3矩阵的行列式
		 * @return 矩阵的行列式
		 */
		public function determinant():Number{
			return null;
		}

		/**
		 * 通过一个二维向量转换3x3矩阵
		 * @param tra 转换向量
		 * @param out 输出矩阵
		 */
		public function translate(trans:Vector2,out:Matrix3x3):void{}

		/**
		 * 根据指定角度旋转3x3矩阵
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		public function rotate(rad:Number,out:Matrix3x3):void{}

		/**
		 * 根据制定缩放3x3矩阵
		 * @param scale 缩放值
		 * @param out 输出矩阵
		 */
		public function scale(scale:Vector2,out:Matrix3x3):void{}

		/**
		 * 计算3x3矩阵的逆矩阵
		 * @param out 输出的逆矩阵
		 */
		public function invert(out:Matrix3x3):void{}

		/**
		 * 计算3x3矩阵的转置矩阵
		 * @param out 输出矩阵
		 */
		public function transpose(out:Matrix3x3):void{}

		/**
		 * 设置已有的矩阵为单位矩阵
		 */
		public function identity():void{}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}

		/**
		 * 计算观察3x3矩阵
		 * @param eye 观察者位置
		 * @param target 目标位置
		 * @param up 上向量
		 * @param out 输出3x3矩阵
		 */
		public static function lookAt(eye:Vector3,target:Vector3,up:Vector3,out:Matrix3x3):void{}
	}

}
