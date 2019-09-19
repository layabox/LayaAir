package laya.display.cmd {
	import laya.maths.Matrix;
	import laya.resource.Context;

	/**
	 * 矩阵命令
	 */
	public class TransformCmd {
		public static var ID:String;

		/**
		 * 矩阵。
		 */
		public var matrix:Matrix;

		/**
		 * （可选）水平方向轴心点坐标。
		 */
		public var pivotX:Number;

		/**
		 * （可选）垂直方向轴心点坐标。
		 */
		public var pivotY:Number;

		/**
		 * @private 
		 */
		public static function create(matrix:Matrix,pivotX:Number,pivotY:Number):TransformCmd{
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
