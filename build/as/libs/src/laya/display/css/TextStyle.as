package laya.display.css {
	import laya.display.css.SpriteStyle;
	import laya.display.BitmapFont;
	import laya.display.Sprite;
	import laya.resource.Context;

	/**
	 * 文本的样式类
	 */
	public class TextStyle extends SpriteStyle {

		/**
		 * 一个已初始化的 <code>TextStyle</code> 实例。
		 */
		public static var EMPTY:TextStyle;

		/**
		 * 表示使用此文本格式的文本是否为斜体。
		 * @default false
		 */
		public var italic:Boolean;

		/**
		 * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
		 * @default "left"
		 */
		public var align:String;

		/**
		 * <p>表示使用此文本格式的文本字段是否自动换行。</p>
		 * 如果 wordWrap 的值为 true，则该文本字段自动换行；如果值为 false，则该文本字段不自动换行。
		 * @default false。
		 */
		public var wordWrap:Boolean;

		/**
		 * <p>垂直行间距（以像素为单位）</p>
		 */
		public var leading:Number;

		/**
		 * <p>默认边距信息</p>
		 * <p>[左边距，上边距，右边距，下边距]（边距以像素为单位）</p>
		 */
		public var padding:Array;

		/**
		 * 文本背景颜色，以字符串表示。
		 */
		public var bgColor:String;

		/**
		 * 文本边框背景颜色，以字符串表示。
		 */
		public var borderColor:String;

		/**
		 * <p>指定文本字段是否是密码文本字段。</p>
		 * 如果此属性的值为 true，则文本字段被视为密码文本字段，并使用星号而不是实际字符来隐藏输入的字符。如果为 false，则不会将文本字段视为密码文本字段。
		 */
		public var asPassword:Boolean;

		/**
		 * <p>描边宽度（以像素为单位）。</p>
		 * 默认值0，表示不描边。
		 * @default 0
		 */
		public var stroke:Number;

		/**
		 * <p>描边颜色，以字符串表示。</p>
		 * @default "#000000";
		 */
		public var strokeColor:String;

		/**
		 * 是否为粗体
		 */
		public var bold:Boolean;

		/**
		 * 是否显示下划线
		 */
		public var underline:Boolean;

		/**
		 * 下划线颜色
		 */
		public var underlineColor:String;

		/**
		 * 当前使用的位置字体。
		 */
		public var currBitmapFont:BitmapFont;

		/**
		 * @override 
		 */
		override public function reset():SpriteStyle{
			return null;
		}

		/**
		 * @override 
		 */
		override public function recover():void{}

		/**
		 * 从对象池中创建
		 */
		public static function create():TextStyle{
			return null;
		}

		/**
		 * @inheritDoc 
		 */
		public function render(sprite:Sprite,context:Context,x:Number,y:Number):void{}
	}

}
