package laya.d3.math {
	import laya.d3.core.IClone;

	/**
	 * <code>Vector2</code> 类用于创建二维向量。
	 */
	public class Vector2 implements IClone {

		/**
		 * 零向量,禁止修改
		 */
		public static var ZERO:Vector2;

		/**
		 * 一向量,禁止修改
		 */
		public static var ONE:Vector2;

		/**
		 * X轴坐标
		 */
		public var x:Number;

		/**
		 * Y轴坐标
		 */
		public var y:Number;

		/**
		 * 创建一个 <code>Vector2</code> 实例。
		 * @param x X轴坐标。
		 * @param y Y轴坐标。
		 */

		public function Vector2(x:Number = undefined,y:Number = undefined){}

		/**
		 * 设置xy值。
		 * @param x X值。
		 * @param y Y值。
		 */
		public function setValue(x:Number,y:Number):void{}

		/**
		 * 缩放二维向量。
		 * @param a 源二维向量。
		 * @param b 缩放值。
		 * @param out 输出二维向量。
		 */
		public static function scale(a:Vector2,b:Number,out:Vector2):void{}

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
		 * 求两个二维向量的点积。
		 * @param a left向量。
		 * @param b right向量。
		 * @return 点积。
		 */
		public static function dot(a:Vector2,b:Vector2):Number{
			return null;
		}

		/**
		 * 归一化二维向量。
		 * @param s 源三维向量。
		 * @param out 输出三维向量。
		 */
		public static function normalize(s:Vector2,out:Vector2):void{}

		/**
		 * 计算标量长度。
		 * @param a 源三维向量。
		 * @return 标量长度。
		 */
		public static function scalarLength(a:Vector2):Number{
			return null;
		}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
		public function forNativeElement(nativeElements:Float32Array = null):void{}
		public static function rewriteNumProperty(proto:*,name:String,index:Number):void{}
	}

}
