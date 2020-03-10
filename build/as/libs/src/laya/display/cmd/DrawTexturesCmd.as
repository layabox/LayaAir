package laya.display.cmd {
	import laya.resource.Context;
	import laya.resource.Texture;

	/**
	 * 根据坐标集合绘制多个贴图
	 */
	public class DrawTexturesCmd {
		public static var ID:String;

		/**
		 * 纹理。
		 */
		public var texture:Texture;

		/**
		 * 绘制次数和坐标。
		 */
		public var pos:Array;

		/**
		 * @private 
		 */
		public static function create(texture:Texture,pos:Array):DrawTexturesCmd{
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
