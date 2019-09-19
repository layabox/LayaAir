package laya.utils {
	import laya.display.Graphics;

	/**
	 * 鼠标点击区域，可以设置绘制一系列矢量图作为点击区域和非点击区域（目前只支持圆形，矩形，多边形）
	 */
	public class HitArea {

		/**
		 * @private 
		 */
		private static var _cmds:*;

		/**
		 * @private 
		 */
		private static var _rect:*;

		/**
		 * @private 
		 */
		private static var _ptPoint:*;

		/**
		 * @private 
		 */
		private var _hit:*;

		/**
		 * @private 
		 */
		private var _unHit:*;

		/**
		 * 检测对象是否包含指定的点。
		 * @param x 点的 X 轴坐标值（水平位置）。
		 * @param y 点的 Y 轴坐标值（垂直位置）。
		 * @return 如果包含指定的点，则值为 true；否则为 false。
		 */
		public function contains(x:Number,y:Number):Boolean{
			return null;
		}

		/**
		 * 可点击区域，可以设置绘制一系列矢量图作为点击区域（目前只支持圆形，矩形，多边形）
		 */
		public var hit:Graphics;

		/**
		 * 不可点击区域，可以设置绘制一系列矢量图作为非点击区域（目前只支持圆形，矩形，多边形）
		 */
		public var unHit:Graphics;
	}

}
