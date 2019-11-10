package laya.display.cmd {
	import laya.resource.Context;
	import laya.resource.Texture;

	/**
	 * 绘制图片
	 */
	public class DrawImageCmd {
		public static var ID:String;

		/**
		 * 纹理。
		 */
		public var texture:Texture;

		/**
		 * （可选）X轴偏移量。
		 */
		public var x:Number;

		/**
		 * （可选）Y轴偏移量。
		 */
		public var y:Number;

		/**
		 * （可选）宽度。
		 */
		public var width:Number;

		/**
		 * （可选）高度。
		 */
		public var height:Number;

		/**
		 * @private 
		 */
		public static function create(texture:Texture,x:Number,y:Number,width:Number,height:Number):DrawImageCmd{
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
