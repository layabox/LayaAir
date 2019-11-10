package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 根据路径绘制矢量图形
	 */
	public class DrawPathCmd {
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
		 * 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
		 */
		public var paths:Array;

		/**
		 * （可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
		 */
		public var brush:*;

		/**
		 * （可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
		 */
		public var pen:*;

		/**
		 * @private 
		 */
		public static function create(x:Number,y:Number,paths:Array,brush:*,pen:*):DrawPathCmd{
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
