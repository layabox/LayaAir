package laya.display.cmd {
	import laya.maths.Point;
	import laya.resource.Context;
	import laya.resource.Texture;

	/**
	 * 填充贴图
	 */
	public class FillTextureCmd {
		public static var ID:String;

		/**
		 * 纹理。
		 */
		public var texture:Texture;

		/**
		 * X轴偏移量。
		 */
		public var x:Number;

		/**
		 * Y轴偏移量。
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
		 * （可选）填充类型 repeat|repeat-x|repeat-y|no-repeat
		 */
		public var type:String;

		/**
		 * （可选）贴图纹理偏移
		 */
		public var offset:Point;

		/**
		 * @private 
		 */
		public var other:*;

		/**
		 * @private 
		 */
		public static function create(texture:Texture,x:Number,y:Number,width:Number,height:Number,type:String,offset:Point,other:*):FillTextureCmd{
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
