package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 绘制多边形
	 */
	public class DrawPolyCmd {
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
		 * 多边形的点集合。
		 */
		public var points:Array;

		/**
		 * 填充颜色，或者填充绘图的渐变对象。
		 */
		public var fillColor:*;

		/**
		 * （可选）边框颜色，或者填充绘图的渐变对象。
		 */
		public var lineColor:*;

		/**
		 * 可选）边框宽度。
		 */
		public var lineWidth:Number;

		/**
		 * @private 
		 */
		public var isConvexPolygon:Boolean;

		/**
		 * @private 
		 */
		public var vid:Number;

		/**
		 * @private 
		 */
		public static function create(x:Number,y:Number,points:Array,fillColor:*,lineColor:*,lineWidth:Number,isConvexPolygon:Boolean,vid:Number):DrawPolyCmd{
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
