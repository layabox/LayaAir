package laya.d3.math.Native {
	import laya.d3.core.IClone;

	/**
	 * <code>Vector4</code> 类用于创建四维向量。
	 */
	public class ConchVector4 implements IClone {

		/**
		 * 零向量，禁止修改
		 */
		public static var ZERO:ConchVector4;
		public static var ONE:ConchVector4;
		public static var UnitX:ConchVector4;
		public static var UnitY:ConchVector4;
		public static var UnitZ:ConchVector4;
		public static var UnitW:ConchVector4;

		/**
		 * [只读]向量元素集合。
		 */
		public var elements:Float32Array;

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
		 * 获取W轴坐标。
		 * @return W轴坐标。
		 */

		/**
		 * 设置W轴坐标。
		 * @param value W轴坐标。
		 */
		public var w:Number;

		/**
		 * 创建一个 <code>Vector4</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 * @param z Z轴坐标。
		 * @param w W轴坐标。
		 */

		public function ConchVector4(x:Number = undefined,y:Number = undefined,z:Number = undefined,w:Number = undefined){}

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

		/**
		 * 插值四维向量。
		 * @param a left向量。
		 * @param b right向量。
		 * @param t 插值比例。
		 * @param out 输出向量。
		 */
		public static function lerp(a:ConchVector4,b:ConchVector4,t:Number,out:ConchVector4):void{}

		/**
		 * 通过4x4矩阵把一个四维向量转换为另一个四维向量
		 * @param vector4 带转换四维向量。
		 * @param M4x4 4x4矩阵。
		 * @param out 转换后四维向量。
		 */
		public static function transformByM4x4(vector4:ConchVector4,m4x4:*,out:ConchVector4):void{}

		/**
		 * 判断两个四维向量是否相等。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @return 是否相等。
		 */
		public static function equals(a:ConchVector4,b:ConchVector4):Boolean{
			return null;
		}

		/**
		 * 求四维向量的长度。
		 * @return 长度。
		 */
		public function length():Number{
			return null;
		}

		/**
		 * 求四维向量长度的平方。
		 * @return 长度的平方。
		 */
		public function lengthSquared():Number{
			return null;
		}

		/**
		 * 归一化四维向量。
		 * @param s 源四维向量。
		 * @param out 输出四维向量。
		 */
		public static function normalize(s:ConchVector4,out:ConchVector4):void{}

		/**
		 * 求两个四维向量的和。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		public static function add(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}

		/**
		 * 求两个四维向量的差。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		public static function subtract(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}

		/**
		 * 计算两个四维向量的乘积。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 输出向量。
		 */
		public static function multiply(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}

		/**
		 * 缩放四维向量。
		 * @param a 源四维向量。
		 * @param b 缩放值。
		 * @param out 输出四维向量。
		 */
		public static function scale(a:ConchVector4,b:Number,out:ConchVector4):void{}

		/**
		 * 求一个指定范围的四维向量
		 * @param value clamp向量
		 * @param min 最小
		 * @param max 最大
		 * @param out 输出向量
		 */
		public static function Clamp(value:ConchVector4,min:ConchVector4,max:ConchVector4,out:ConchVector4):void{}

		/**
		 * 两个四维向量距离的平方。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离的平方。
		 */
		public static function distanceSquared(value1:ConchVector4,value2:ConchVector4):Number{
			return null;
		}

		/**
		 * 两个四维向量距离。
		 * @param value1 向量1。
		 * @param value2 向量2。
		 * @return 距离。
		 */
		public static function distance(value1:ConchVector4,value2:ConchVector4):Number{
			return null;
		}

		/**
		 * 求两个四维向量的点积。
		 * @param a 向量。
		 * @param b 向量。
		 * @return 点积。
		 */
		public static function dot(a:ConchVector4,b:ConchVector4):Number{
			return null;
		}

		/**
		 * 分别取两个四维向量x、y、z的最小值计算新的四维向量。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 结果三维向量。
		 */
		public static function min(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}

		/**
		 * 分别取两个四维向量x、y、z的最大值计算新的四维向量。
		 * @param a 四维向量。
		 * @param b 四维向量。
		 * @param out 结果三维向量。
		 */
		public static function max(a:ConchVector4,b:ConchVector4,out:ConchVector4):void{}
	}

}
