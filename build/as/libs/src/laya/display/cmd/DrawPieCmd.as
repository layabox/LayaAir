package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 绘制扇形
	 */
	public class DrawPieCmd {
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
		 * 扇形半径。
		 */
		public var radius:Number;
		private var _startAngle:*;
		private var _endAngle:*;

		/**
		 * 填充颜色，或者填充绘图的渐变对象。
		 */
		public var fillColor:*;

		/**
		 * （可选）边框颜色，或者填充绘图的渐变对象。
		 */
		public var lineColor:*;

		/**
		 * （可选）边框宽度。
		 */
		public var lineWidth:Number;

		/**
		 * @private 
		 */
		public var vid:Number;

		/**
		 * @private 
		 */
		public static function create(x:Number,y:Number,radius:Number,startAngle:Number,endAngle:Number,fillColor:*,lineColor:*,lineWidth:Number,vid:Number):DrawPieCmd{
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

		/**
		 * 开始角度。
		 */
		public var startAngle:Number;

		/**
		 * 结束角度。
		 */
		public var endAngle:Number;
	}

}
