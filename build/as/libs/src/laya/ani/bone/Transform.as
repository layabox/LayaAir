package laya.ani.bone {
	import laya.maths.Matrix;
	import laya.maths.Matrix;
	public class Transform {

		/**
		 * 水平方向旋转角度
		 */
		public var skX:Number;

		/**
		 * 垂直方向旋转角度
		 */
		public var skY:Number;

		/**
		 * 水平方向缩放
		 */
		public var scX:Number;

		/**
		 * 垂直方向缩放
		 */
		public var scY:Number;

		/**
		 * 水平方向偏移
		 */
		public var x:Number;

		/**
		 * 垂直方向偏移
		 */
		public var y:Number;

		/**
		 * 水平方向倾斜角度
		 */
		public var skewX:Number;

		/**
		 * 垂直方向倾斜角度
		 */
		public var skewY:Number;
		private var mMatrix:*;

		/**
		 * 初始化数据
		 * @param data 
		 */
		public function initData(data:*):void{}

		/**
		 * 获取当前矩阵
		 */
		public function getMatrix():Matrix{
			return null;
		}

		/**
		 * 获取倾斜矩阵
		 * @param m 
		 * @param x 
		 * @param y 
		 */
		public function skew(m:Matrix,x:Number,y:Number):Matrix{
			return null;
		}
	}

}
