package laya.display.cmd {
	import laya.resource.Context;
	import laya.utils.WordText;
	import laya.utils.HTMLChar;

	/**
	 * 绘制文字
	 */
	public class FillTextCmd {
		public static var ID:String;
		private var _text:*;
		public var _words:Array;

		/**
		 * 开始绘制文本的 x 坐标位置（相对于画布）。
		 */
		public var x:Number;

		/**
		 * 开始绘制文本的 y 坐标位置（相对于画布）。
		 */
		public var y:Number;
		private var _font:*;
		private var _color:*;
		private var _borderColor:*;
		private var _lineWidth:*;
		private var _textAlign:*;
		private var _fontColor:*;
		private var _strokeColor:*;
		private static var _defFontObj:*;
		private var _fontObj:*;
		private var _nTexAlign:*;

		/**
		 * @private 
		 */
		public static function create(text:*,words:Array,x:Number,y:Number,font:String,color:String,textAlign:String,lineWidth:Number,borderColor:String):FillTextCmd{
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

		/**
		 * 在画布上输出的文本。
		 */
		public var text:*;

		/**
		 * 定义字号和字体，比如"20px Arial"。
		 */
		public var font:String;

		/**
		 * 定义文本颜色，比如"#ff0000"。
		 */
		public var color:String;

		/**
		 * 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		public var textAlign:String;
	}

}
