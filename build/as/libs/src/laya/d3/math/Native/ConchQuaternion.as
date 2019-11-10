package laya.d3.math.Native {
	import laya.d3.math.Native.ConchVector3;
	import laya.d3.core.IClone;
	import laya.d3.math.Matrix3x3;
	import laya.d3.math.Matrix4x4;

	/**
	 * <code>Quaternion</code> 类用于创建四元数。
	 */
	public class ConchQuaternion implements IClone {

		/**
		 * 默认矩阵,禁止修改
		 */
		public static var DEFAULT:ConchQuaternion;

		/**
		 * 无效矩阵,禁止修改
		 */
		public static var NAN:ConchQuaternion;

		/**
		 * 从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
		 * @param yaw yaw值
		 * @param pitch pitch值
		 * @param roll roll值
		 * @param out 输出四元数
		 */
		public static function createFromYawPitchRoll(yaw:Number,pitch:Number,roll:Number,out:ConchQuaternion):void{}

		/**
		 * 计算两个四元数相乘
		 * @param left left四元数
		 * @param right right四元数
		 * @param out 输出四元数
		 */
		public static function multiply(left:ConchQuaternion,right:ConchQuaternion,out:ConchQuaternion):void{}
		private static var arcTanAngle:*;
		private static var angleTo:*;

		/**
		 * 从指定的轴和角度计算四元数
		 * @param axis 轴
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		public static function createFromAxisAngle(axis:ConchVector3,rad:Number,out:ConchQuaternion):void{}

		/**
		 * 根据3x3矩阵计算四元数
		 * @param sou 源矩阵
		 * @param out 输出四元数
		 */
		public static function createFromMatrix3x3(sou:Matrix3x3,out:ConchQuaternion):void{}

		/**
		 * 从旋转矩阵计算四元数
		 * @param mat 旋转矩阵
		 * @param out 输出四元数
		 */
		public static function createFromMatrix4x4(mat:Matrix4x4,out:ConchQuaternion):void{}

		/**
		 * 球面插值
		 * @param left left四元数
		 * @param right right四元数
		 * @param a 插值比例
		 * @param out 输出四元数
		 * @return 输出Float32Array
		 */
		public static function slerp(left:ConchQuaternion,right:ConchQuaternion,t:Number,out:ConchQuaternion):Float32Array{
			return null;
		}

		/**
		 * 计算两个四元数的线性插值
		 * @param left left四元数
		 * @param right right四元数b
		 * @param t 插值比例
		 * @param out 输出四元数
		 */
		public static function lerp(left:ConchQuaternion,right:ConchQuaternion,amount:Number,out:ConchQuaternion):void{}

		/**
		 * 计算两个四元数的和
		 * @param left left四元数
		 * @param right right 四元数
		 * @param out 输出四元数
		 */
		public static function add(left:*,right:ConchQuaternion,out:ConchQuaternion):void{}

		/**
		 * 计算两个四元数的点积
		 * @param left left四元数
		 * @param right right四元数
		 * @return 点积
		 */
		public static function dot(left:*,right:ConchQuaternion):Number{
			return null;
		}

		/**
		 * 四元数元素数组
		 */
		public var elements:Float32Array;

		/**
		 * 获取四元数的x值
		 */

		/**
		 * 设置四元数的x值
		 */
		public var x:Number;

		/**
		 * 获取四元数的y值
		 */

		/**
		 * 设置四元数的y值
		 */
		public var y:Number;

		/**
		 * 获取四元数的z值
		 */

		/**
		 * 设置四元数的z值
		 */
		public var z:Number;

		/**
		 * 获取四元数的w值
		 */

		/**
		 * 设置四元数的w值
		 */
		public var w:Number;

		/**
		 * 创建一个 <code>Quaternion</code> 实例。
		 * @param x 四元数的x值
		 * @param y 四元数的y值
		 * @param z 四元数的z值
		 * @param w 四元数的w值
		 */

		public function ConchQuaternion(x:Number = undefined,y:Number = undefined,z:Number = undefined,w:Number = undefined,nativeElements:Float32Array = undefined){}

		/**
		 * 根据缩放值缩放四元数
		 * @param scale 缩放值
		 * @param out 输出四元数
		 */
		public function scaling(scaling:Number,out:ConchQuaternion):void{}

		/**
		 * 归一化四元数
		 * @param out 输出四元数
		 */
		public function normalize(out:ConchQuaternion):void{}

		/**
		 * 计算四元数的长度
		 * @return 长度
		 */
		public function length():Number{
			return null;
		}

		/**
		 * 根据绕X轴的角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		public function rotateX(rad:Number,out:ConchQuaternion):void{}

		/**
		 * 根据绕Y轴的制定角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		public function rotateY(rad:Number,out:ConchQuaternion):void{}

		/**
		 * 根据绕Z轴的制定角度旋转四元数
		 * @param rad 角度
		 * @param out 输出四元数
		 */
		public function rotateZ(rad:Number,out:ConchQuaternion):void{}

		/**
		 * 分解四元数到欧拉角（顺序为Yaw、Pitch、Roll），参考自http://xboxforums.create.msdn.com/forums/p/4574/23988.aspx#23988,问题绕X轴翻转超过±90度时有，会产生瞬间反转
		 * @param quaternion 源四元数
		 * @param out 欧拉角值
		 */
		public function getYawPitchRoll(out:ConchVector3):void{}

		/**
		 * 求四元数的逆
		 * @param out 输出四元数
		 */
		public function invert(out:ConchQuaternion):void{}

		/**
		 * 设置四元数为单位算数
		 * @param out 输出四元数
		 */
		public function identity():void{}

		/**
		 * 从Array数组拷贝值。
		 * @param array 数组。
		 * @param offset 数组偏移。
		 */
		public function fromArray(array:Array,offset:Number = null):void{}

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
		public function equals(b:ConchQuaternion):Boolean{
			return null;
		}

		/**
		 * 计算旋转观察四元数
		 * @param forward 方向
		 * @param up 上向量
		 * @param out 输出四元数
		 */
		public static function rotationLookAt(forward:ConchVector3,up:ConchVector3,out:ConchQuaternion):void{}

		/**
		 * 计算观察四元数
		 * @param eye 观察者位置
		 * @param target 目标位置
		 * @param up 上向量
		 * @param out 输出四元数
		 */
		public static function lookAt(eye:*,target:*,up:*,out:ConchQuaternion):void{}

		/**
		 * 计算长度的平方。
		 * @return 长度的平方。
		 */
		public function lengthSquared():Number{
			return null;
		}

		/**
		 * 计算四元数的逆四元数。
		 * @param value 四元数。
		 * @param out 逆四元数。
		 */
		public static function invert(value:ConchQuaternion,out:ConchQuaternion):void{}

		/**
		 * 通过一个3x3矩阵创建一个四元数
		 * @param matrix3x3 3x3矩阵
		 * @param out 四元数
		 */
		public static function rotationMatrix(matrix3x3:Matrix3x3,out:ConchQuaternion):void{}
	}

}
