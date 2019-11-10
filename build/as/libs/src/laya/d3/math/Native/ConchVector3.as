package laya.d3.math.Native {
	import laya.d3.math.Native.ConchVector4;
	import laya.d3.math.Native.ConchQuaternion;
	import laya.d3.core.IClone;

	/**
	 * <code>Vector3</code> 类用于创建三维向量。
	 */
	public class ConchVector3 implements IClone {

		/**
		 * 零向量，禁止修改
		 */
		public static var ZERO:ConchVector3;

		/**
		 * 一向量，禁止修改
		 */
		public static var ONE:ConchVector3;

		/**
		 * X轴单位向量，禁止修改
		 */
		public static var NegativeUnitX:ConchVector3;

		/**
		 * X轴单位向量，禁止修改
		 */
		public static var UnitX:ConchVector3;

		/**
		 * Y轴单位向量，禁止修改
		 */
		public static var UnitY:ConchVector3;

		/**
		 * Z轴单位向量，禁止修改
		 */
		public static var UnitZ:ConchVector3;

		/**
		 * 右手坐标系统前向量，禁止修改
		 */
		public static var ForwardRH:ConchVector3;

		/**
		 * 左手坐标系统前向量,禁止修改
		 */
		public static var ForwardLH:ConchVector3;

		/**
		 * 上向量,禁止修改
		 */
		public static var Up:ConchVector3;

		/**
		 * 无效矩阵,禁止修改
		 */
		public static var NAN:ConchVector3;

		/**
		 * [只读]向量元素集合。
		 */
		public var elements:Float32Array;

		/**
		 * 两个三维向量距离的平方。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离的平方。
		 */
		public static function distanceSquared(value1:ConchVector3,value2:ConchVector3):Number{
			return null;
		}

		/**
		 * 两个三维向量距离。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离。
		 */
		public static function distance(value1:ConchVector3,value2:ConchVector3):Number{
			return null;
		}

		/**
		 * 分别取两个三维向量x、y、z的最小值计算新的三维向量。
		 * @param a 。
		 * @param b 。
		 * @param out 。
		 */
		public static function min(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}

		/**
		 * 分别取两个三维向量x、y、z的最大值计算新的三维向量。
		 * @param a a三维向量。
		 * @param b b三维向量。
		 * @param out 结果三维向量。
		 */
		public static function max(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}

		/**
		 * 根据四元数旋转三维向量。
		 * @param source 源三维向量。
		 * @param rotation 旋转四元数。
		 * @param out 输出三维向量。
		 */
		public static function transformQuat(source:ConchVector3,rotation:ConchQuaternion,out:ConchVector3):void{}

		/**
		 * 计算标量长度。
		 * @param a 源三维向量。
		 * @return 标量长度。
		 */
		public static function scalarLength(a:ConchVector3):Number{
			return null;
		}

		/**
		 * 计算标量长度的平方。
		 * @param a 源三维向量。
		 * @return 标量长度的平方。
		 */
		public static function scalarLengthSquared(a:ConchVector3):Number{
			return null;
		}

		/**
		 * 归一化三维向量。
		 * @param s 源三维向量。
		 * @param out 输出三维向量。
		 */
		public static function normalize(s:ConchVector3,out:ConchVector3):void{}

		/**
		 * 计算两个三维向量的乘积。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param out 输出三维向量。
		 */
		public static function multiply(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}

		/**
		 * 缩放三维向量。
		 * @param a 源三维向量。
		 * @param b 缩放值。
		 * @param out 输出三维向量。
		 */
		public static function scale(a:ConchVector3,b:Number,out:ConchVector3):void{}

		/**
		 * 插值三维向量。
		 * @param a left向量。
		 * @param b right向量。
		 * @param t 插值比例。
		 * @param out 输出向量。
		 */
		public static function lerp(a:ConchVector3,b:ConchVector3,t:Number,out:ConchVector3):void{}

		/**
		 * 通过矩阵转换一个三维向量到另外一个三维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量。
		 */
		public static function transformV3ToV3(vector:ConchVector3,transform:*,result:ConchVector3):void{}

		/**
		 * 通过矩阵转换一个三维向量到另外一个四维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出四维向量。
		 */
		public static function transformV3ToV4(vector:ConchVector3,transform:*,result:ConchVector4):void{}

		/**
		 * 通过法线矩阵转换一个法线三维向量到另外一个三维向量。
		 * @param normal 源法线三维向量。
		 * @param transform 法线变换矩阵。
		 * @param result 输出法线三维向量。
		 */
		public static function TransformNormal(normal:ConchVector3,transform:*,result:ConchVector3):void{}

		/**
		 * 通过矩阵转换一个三维向量到另外一个归一化的三维向量。
		 * @param vector 源三维向量。
		 * @param transform 变换矩阵。
		 * @param result 输出三维向量。
		 */
		public static function transformCoordinate(coordinate:ConchVector3,transform:*,result:ConchVector3):void{}

		/**
		 * 求一个指定范围的向量
		 * @param value clamp向量
		 * @param min 最小
		 * @param max 最大
		 * @param out 输出向量
		 */
		public static function Clamp(value:ConchVector3,min:ConchVector3,max:ConchVector3,out:ConchVector3):void{}

		/**
		 * 求两个三维向量的和。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param out 输出向量。
		 */
		public static function add(a:ConchVector3,b:ConchVector3,out:ConchVector3):void{}

		/**
		 * 求两个三维向量的差。
		 * @param a left三维向量。
		 * @param b right三维向量。
		 * @param o out 输出向量。
		 */
		public static function subtract(a:ConchVector3,b:ConchVector3,o:ConchVector3):void{}

		/**
		 * 求两个三维向量的叉乘。
		 * @param a left向量。
		 * @param b right向量。
		 * @param o 输出向量。
		 */
		public static function cross(a:ConchVector3,b:ConchVector3,o:ConchVector3):void{}

		/**
		 * 求两个三维向量的点积。
		 * @param a left向量。
		 * @param b right向量。
		 * @return 点积。
		 */
		public static function dot(a:ConchVector3,b:ConchVector3):Number{
			return null;
		}

		/**
		 * 判断两个三维向量是否相等。
		 * @param a 三维向量。
		 * @param b 三维向量。
		 * @return 是否相等。
		 */
		public static function equals(a:ConchVector3,b:ConchVector3):Boolean{
			return null;
		}

		/**
		 * 获取X轴坐标。
		 * @return X轴坐标。
		 */

		/**
		 * 设置X轴坐标。
		 * @param value X轴坐标。
		 */
		public var x:Number;

		/**
		 * 获取Y轴坐标。
		 * @return Y轴坐标。
		 */

		/**
		 * 设置Y轴坐标。
		 * @param value Y轴坐标。
		 */
		public var y:Number;

		/**
		 * 获取Z轴坐标。
		 * @return Z轴坐标。
		 */

		/**
		 * 设置Z轴坐标。
		 * @param value Z轴坐标。
		 */
		public var z:Number;

		/**
		 * 创建一个 <code>Vector3</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 * @param z Z轴坐标。
		 */

		public function ConchVector3(x:Number = undefined,y:Number = undefined,z:Number = undefined,nativeElements:Float32Array = undefined){}

		/**
		 * 设置xyz值。
		 * @param x X值。
		 * @param y Y值。
		 * @param z Z值。
		 */
		public function setValue(x:Number,y:Number,z:Number):void{}

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
		public function toDefault():void{}
	}

}
