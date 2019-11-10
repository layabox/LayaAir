package laya.display.cmd {
	import laya.filters.ColorFilter;
	import laya.maths.Matrix;
	import laya.resource.Context;
	import laya.resource.Texture;

	/**
	 * 绘制单个贴图
	 */
	public class DrawTextureCmd {
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
		 * （可选）矩阵信息。
		 */
		public var matrix:Matrix;

		/**
		 * （可选）透明度。
		 */
		public var alpha:Number;

		/**
		 * （可选）颜色滤镜。
		 */
		public var color:String;
		public var colorFlt:ColorFilter;

		/**
		 * （可选）混合模式。
		 */
		public var blendMode:String;
		public var uv:Array;

		/**
		 * @private 
		 */
		public static function create(texture:Texture,x:Number,y:Number,width:Number,height:Number,matrix:Matrix,alpha:Number,color:String,blendMode:String,uv:Array = null):DrawTextureCmd{
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
