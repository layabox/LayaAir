package laya.maths {
	import laya.maths.Point;

	/**
	 * @private 凸包算法。
	 */
	public class GrahamScan {
		private static var _mPointList:*;
		private static var _tempPointList:*;
		private static var _temPList:*;
		private static var _temArr:*;
		public static function multiply(p1:Point,p2:Point,p0:Point):Number{
			return null;
		}

		/**
		 * 计算两个点的距离。
		 * @param p1 
		 * @param p2 
		 * @return 
		 */
		public static function dis(p1:Point,p2:Point):Number{
			return null;
		}
		private static var _getPoints:*;

		/**
		 * 将数组 src 从索引0位置 依次取 cout 个项添加至 tst 数组的尾部。
		 * @param rst 原始数组，用于添加新的子元素。
		 * @param src 用于取子元素的数组。
		 * @param count 需要取得子元素个数。
		 * @return 添加完子元素的 rst 对象。
		 */
		public static function getFrom(rst:Array,src:Array,count:Number):Array{
			return null;
		}

		/**
		 * 将数组 src 从末尾索引位置往头部索引位置方向 依次取 cout 个项添加至 tst 数组的尾部。
		 * @param rst 原始数组，用于添加新的子元素。
		 * @param src 用于取子元素的数组。
		 * @param count 需要取得子元素个数。
		 * @return 添加完子元素的 rst 对象。
		 */
		public static function getFromR(rst:Array,src:Array,count:Number):Array{
			return null;
		}

		/**
		 * [x,y...]列表 转 Point列表
		 * @param pList Point列表
		 * @return [x,y...]列表
		 */
		public static function pListToPointList(pList:Array,tempUse:Boolean = null):Array{
			return null;
		}

		/**
		 * Point列表转[x,y...]列表
		 * @param pointList Point列表
		 * @return [x,y...]列表
		 */
		public static function pointListToPlist(pointList:Array):Array{
			return null;
		}

		/**
		 * 寻找包括所有点的最小多边形顶点集合
		 * @param pList 形如[x0,y0,x1,y1...]的点列表
		 * @return 最小多边形顶点集合
		 */
		public static function scanPList(pList:Array):Array{
			return null;
		}

		/**
		 * 寻找包括所有点的最小多边形顶点集合
		 * @param PointSet Point列表
		 * @return 最小多边形顶点集合
		 */
		public static function scan(PointSet:Array):Array{
			return null;
		}
	}

}
