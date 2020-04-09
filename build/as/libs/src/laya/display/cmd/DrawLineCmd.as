package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 绘制单条曲线
	 */
	public class DrawLineCmd {
		public static var ID:String;

		/**
		 * X轴开始位置。
		 */
		public var fromX:Number;

		/**
		 * Y轴开始位置。
		 */
		public var fromY:Number;

		/**
		 * X轴结束位置。
		 */
		public var toX:Number;

		/**
		 * Y轴结束位置。
		 */
		public var toY:Number;

		/**
		 * 颜色。
		 */
		public var lineColor:String;

		/**
		 * （可选）线条宽度。
		 */
		public var lineWidth:Number;

		/**
		 * @private 
		 */
		public var vid:Number;

		/**
		 * @private 
		 */
		public static function create(fromX:Number,fromY:Number,toX:Number,toY:Number,lineColor:String,lineWidth:Number,vid:Number):DrawLineCmd{
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
