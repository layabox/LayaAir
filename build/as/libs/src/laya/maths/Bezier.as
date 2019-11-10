package laya.maths {

	/**
	 * @private 计算贝塞尔曲线的工具类。
	 */
	public class Bezier {

		/**
		 * 工具类单例
		 */
		public static var I:Bezier;

		/**
		 * @private 
		 */
		private var _controlPoints:*;

		/**
		 * @private 
		 */
		private var _calFun:*;

		/**
		 * @private 
		 */
		private var _switchPoint:*;

		/**
		 * 计算二次贝塞尔点。
		 */
		public function getPoint2(t:Number,rst:Array):void{}

		/**
		 * 计算三次贝塞尔点
		 */
		public function getPoint3(t:Number,rst:Array):void{}

		/**
		 * 计算贝塞尔点序列
		 */
		public function insertPoints(count:Number,rst:Array):void{}

		/**
		 * 获取贝塞尔曲线上的点。
		 * @param pList 控制点[x0,y0,x1,y1...]
		 * @param inSertCount 每次曲线的插值数量
		 */
		public function getBezierPoints(pList:Array,inSertCount:Number = null,count:Number = null):Array{
			return null;
		}
	}

}
