package laya.display.cmd {
	import laya.resource.Context;

	/*
	 * 填充文字命令
	 * @private 
	 */
	public class FillWordsCmd {
		public static var ID:String;

		/*
		 * 文字数组
		 */
		public var words:Array;

		/*
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		public var x:Number;

		/*
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		public var y:Number;

		/*
		 * 定义字体和字号，比如"20px Arial"。
		 */
		public var font:String;

		/*
		 * 定义文本颜色，比如"#ff0000"。
		 */
		public var color:String;

		/*
		 * @private 
		 */
		public static function create(words:Array,x:Number,y:Number,font:String,color:String):FillWordsCmd{
			return null;
		}

		/*
		 * 回收到对象池
		 */
		public function recover():void{}

		/*
		 * @private 
		 */
		public function run(context:Context,gx:Number,gy:Number):void{}

		/*
		 * @private 
		 */
		public function get cmdID():String{
				return null;
		}
	}

}
