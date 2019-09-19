package laya.display {
	import laya.maths.Rectangle;

	/**
	 * @private Graphic bounds数据类
	 */
	public class GraphicsBounds {

		/**
		 * @private 
		 */
		private static var _tempMatrix:*;

		/**
		 * @private 
		 */
		private static var _initMatrix:*;

		/**
		 * @private 
		 */
		private static var _tempPoints:*;

		/**
		 * @private 
		 */
		private static var _tempMatrixArrays:*;

		/**
		 * @private 
		 */
		private static var _tempCmds:*;

		/**
		 * @private 
		 */
		private var _temp:*;

		/**
		 * @private 
		 */
		private var _bounds:*;

		/**
		 * @private 
		 */
		private var _rstBoundPoints:*;

		/**
		 * @private 
		 */
		private var _cacheBoundsType:*;

		/**
		 * 销毁
		 */
		public function destroy():void{}

		/**
		 * 创建
		 */
		public static function create():GraphicsBounds{
			return null;
		}

		/**
		 * 重置数据
		 */
		public function reset():void{}

		/**
		 * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
		 * @param realSize （可选）使用图片的真实大小，默认为false
		 * @return 位置与宽高组成的 一个 Rectangle 对象。
		 */
		public function getBounds(realSize:Boolean = null):Rectangle{
			return null;
		}

		/**
		 * @private 
		 * @param realSize （可选）使用图片的真实大小，默认为false获取端点列表。
		 */
		public function getBoundPoints(realSize:Boolean = null):Array{
			return null;
		}
		private var _getCmdPoints:*;
		private var _switchMatrix:*;
		private static var _addPointArrToRst:*;
		private static var _addPointToRst:*;

		/**
		 * 获得drawPie命令可能的产生的点。注意 这里只假设用在包围盒计算上。
		 * @param x 
		 * @param y 
		 * @param radius 
		 * @param startAngle 
		 * @param endAngle 
		 * @return 
		 */
		private var _getPiePoints:*;
		private var _getTriAngBBXPoints:*;
		private var _getDraw9GridBBXPoints:*;
		private var _getPathPoints:*;
	}

}
