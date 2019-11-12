package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 绘制曲线
	 */
	public class DrawCurvesCmd {
		public static var ID:String;

		/**
		 * 开始绘制的 X 轴位置。
		 */
		public var x:Number;

		/**
		 * 开始绘制的 Y 轴位置。
		 */
		public var y:Number;

		/**
		 * 线段的点集合，格式[controlX, controlY, anchorX, anchorY...]。
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
		public static function create(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number):DrawCurvesCmd{
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
