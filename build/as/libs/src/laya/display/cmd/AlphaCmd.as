package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 透明命令
	 */
	public class AlphaCmd {
		public static var ID:String;

		/**
		 * 透明度
		 */
		public var alpha:Number;

		/**
		 * @private 
		 */
		public static function create(alpha:Number):AlphaCmd{
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
