package laya.display.cmd {
	import laya.resource.Context;

	/**
	 * 绘制粒子
	 * @private 
	 */
	public class DrawParticleCmd {
		public static var ID:String;
		private var _templ:*;

		/**
		 * @private 
		 */
		public static function create(_temp:*):DrawParticleCmd{
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
