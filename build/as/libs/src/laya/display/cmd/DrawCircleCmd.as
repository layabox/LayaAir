package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 绘制圆形
	 */
	public class DrawCircleCmd {
		public static var ID:String;

		/**
		 * 圆点X 轴位置。
		 */
		public var x:Number;

		/**
		 * 圆点Y 轴位置。
		 */
		public var y:Number;

		/**
		 * 半径。
		 */
		public var radius:Number;

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
		public static function create(x:Number,y:Number,radius:Number,fillColor:*,lineColor:*,lineWidth:Number,vid:Number):DrawCircleCmd{
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
