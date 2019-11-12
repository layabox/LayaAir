package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 绘制连续曲线
	 */
	public class DrawLinesCmd {
		public static var ID:String;

		/**
		 * 开始绘制的X轴位置。
		 */
		public var x:Number;

		/**
		 * 开始绘制的Y轴位置。
		 */
		public var y:Number;

		/**
		 * 线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
		 */
		public var points:Array;

		/**
		 * 线段颜色，或者填充绘图的渐变对象。
		 */
		public var lineColor:*;

		/**
		 * （可选）线段宽度。
		 */
		public var lineWidth:Number;

		/**
		 * @private 
		 */
		public var vid:Number;

		/**
		 * @private 
		 */
		public static function create(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number,vid:Number):DrawLinesCmd{
			return null;
		}

		/**
		 * 回收到对象池
		 */
		public function recover():void{}

		/**
		 * @private 
		 */
		public function run(context:Context,gx:Number,gy:Number):void{}

		/**
		 * @private 
		 */
		public function get cmdID():String{
				return null;
		}
	}

}
