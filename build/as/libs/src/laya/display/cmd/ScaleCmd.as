package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 缩放命令
	 */
	public class ScaleCmd {
		public static var ID:String;

		/**
		 * 水平方向缩放值。
		 */
		public var scaleX:Number;

		/**
		 * 垂直方向缩放值。
		 */
		public var scaleY:Number;

		/**
		 * （可选）水平方向轴心点坐标。
		 */
		public var pivotX:Number;

		/**
		 * （可选）垂直方向轴心点坐标。
		 */
		public var pivotY:Number;

		/**
		 * @private 
		 */
		public static function create(scaleX:Number,scaleY:Number,pivotX:Number,pivotY:Number):ScaleCmd{
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
