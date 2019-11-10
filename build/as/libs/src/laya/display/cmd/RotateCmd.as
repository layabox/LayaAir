package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 旋转命令
	 */
	public class RotateCmd {
		public static var ID:String;

		/**
		 * 旋转角度，以弧度计。
		 */
		public var angle:Number;

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
		public static function create(angle:Number,pivotX:Number,pivotY:Number):RotateCmd{
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
