package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 恢复命令，和save配套使用
	 */
	public class RestoreCmd {
		public static var ID:String;

		/**
		 * @private 
		 */
		public static function create():RestoreCmd{
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
