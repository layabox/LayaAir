package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 位移命令
	 */
	public class TranslateCmd {
		public static var ID:String;

		/**
		 * 添加到水平坐标（x）上的值。
		 */
		public var tx:Number;

		/**
		 * 添加到垂直坐标（y）上的值。
		 */
		public var ty:Number;

		/**
		 * @private 
		 */
		public static function create(tx:Number,ty:Number):TranslateCmd{
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
