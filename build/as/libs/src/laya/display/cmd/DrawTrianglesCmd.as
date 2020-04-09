package laya.display.cmd {
	import laya.filters.ColorFilter;
	import laya.maths.Matrix;
	import laya.resource.Context;
	import laya.resource.Texture;

	/**
	 * 绘制三角形命令
	 */
	public class DrawTrianglesCmd {
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
		 * 顶点数组。
		 */
		public var vertices:Float32Array;

		/**
		 * UV数据。
		 */
		public var uvs:Float32Array;

		/**
		 * 顶点索引。
		 */
		public var indices:Uint16Array;

		/**
		 * 缩放矩阵。
		 */
		public var matrix:Matrix;

		/**
		 * alpha
		 */
		public var alpha:Number;

		/**
		 * blend模式
		 */
		public var blendMode:String;

		/**
		 * 颜色变换
		 */
		public var color:ColorFilter;
		public var colorNum:Number;

		/**
		 * @private 
		 */
		public static function create(texture:Texture,x:Number,y:Number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:Matrix,alpha:Number,color:String,blendMode:String,colorNum:Number):DrawTrianglesCmd{
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
