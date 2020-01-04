package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 存储命令，和restore配套使用
	 */
	public class SaveCmd {
		public static var ID:String;

		/**
		 * @private 
		 */
		public static function create():SaveCmd{
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
