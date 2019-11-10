package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 裁剪命令
	 */
	public class ClipRectCmd {
		public static var ID:String;

		/**
		 * X 轴偏移量。
		 */
		public var x:Number;

		/**
		 * Y 轴偏移量。
		 */
		public var y:Number;

		/**
		 * 宽度。
		 */
		public var width:Number;

		/**
		 * 高度。
		 */
		public var height:Number;

		/**
		 * @private 
		 */
		public static function create(x:Number,y:Number,width:Number,height:Number):ClipRectCmd{
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
