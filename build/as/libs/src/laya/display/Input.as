package laya.display {
	import laya.display.Text;

	/**
	 * 用户输入一个或多个文本字符时后调度。
	 * @eventType Event.INPUT
	 */

	/**
	 * 文本发生变化后调度。
	 * @eventType Event.CHANGE
	 */

	/**
	 * 用户在输入框内敲回车键后，将会调度 <code>enter</code> 事件。
	 * @eventType Event.ENTER
	 */

	/**
	 * 显示对象获得焦点后调度。
	 * @eventType Event.FOCUS
	 */

	/**
	 * 显示对象失去焦点后调度。
	 * @eventType Event.BLUR
	 */

	/**
	 * <p><code>Input</code> 类用于创建显示对象以显示和输入文本。</p>
	 * <p>Input 类封装了原生的文本输入框，由于不同浏览器的差异，会导致此对象的默认文本的位置与用户点击输入时的文本的位置有少许的偏差。</p>
	 */
	public class Input extends Text {

		/**
		 * 常规文本域。
		 */
		public static var TYPE_TEXT:String;

		/**
		 * password 类型用于密码域输入。
		 */
		public static var TYPE_PASSWORD:String;

		/**
		 * email 类型用于应该包含 e-mail 地址的输入域。
		 */
		public static var TYPE_EMAIL:String;

		/**
		 * url 类型用于应该包含 URL 地址的输入域。
		 */
		public static var TYPE_URL:String;

		/**
		 * number 类型用于应该包含数值的输入域。
		 */
		public static var TYPE_NUMBER:String;

		/**
		 * <p>range 类型用于应该包含一定范围内数字值的输入域。</p>
		 * <p>range 类型显示为滑动条。</p>
		 * <p>您还能够设定对所接受的数字的限定。</p>
		 */
		public static var TYPE_RANGE:String;

		/**
		 * 选取日、月、年。
		 */
		public static var TYPE_DATE:String;

		/**
		 * month - 选取月、年。
		 */
		public static var TYPE_MONTH:String;

		/**
		 * week - 选取周和年。
		 */
		public static var TYPE_WEEK:String;

		/**
		 * time - 选取时间（小时和分钟）。
		 */
		public static var TYPE_TIME:String;

		/**
		 * datetime - 选取时间、日、月、年（UTC 时间）。
		 */
		public static var TYPE_DATE_TIME:String;

		/**
		 * datetime-local - 选取时间、日、月、年（本地时间）。
		 */
		public static var TYPE_DATE_TIME_LOCAL:String;

		/**
		 * <p>search 类型用于搜索域，比如站点搜索或 Google 搜索。</p>
		 * <p>search 域显示为常规的文本域。</p>
		 */
		public static var TYPE_SEARCH:String;

		/**
		 * @private 
		 */
		protected static var input:*;

		/**
		 * @private 
		 */
		protected static var area:*;

		/**
		 * @private 
		 */
		protected static var inputElement:*;

		/**
		 * @private 
		 */
		protected static var inputContainer:*;

		/**
		 * @private 
		 */
		protected static var confirmButton:*;

		/**
		 * @private 
		 */
		protected static var promptStyleDOM:*;

		/**
		 * @private 
		 */
		protected var _focus:Boolean;

		/**
		 * @private 
		 */
		protected var _multiline:Boolean;

		/**
		 * @private 
		 */
		protected var _editable:Boolean;

		/**
		 * @private 
		 */
		protected var _restrictPattern:*;

		/**
		 * @private 
		 */
		protected var _maxChars:Number;
		private var _type:*;

		/**
		 * 输入提示符。
		 */
		private var _prompt:*;

		/**
		 * 输入提示符颜色。
		 */
		private var _promptColor:*;
		private var _originColor:*;
		private var _content:*;

		/**
		 * @private 
		 */
		public static var IOS_IFRAME:Boolean;
		private static var inputHeight:*;

		/**
		 * 表示是否处于输入状态。
		 */
		public static var isInputting:Boolean;

		/**
		 * 创建一个新的 <code>Input</code> 类实例。
		 */

		public function Input(){}
		private static var _popupInputMethod:*;
		private static var _createInputElement:*;
		private static var _initInput:*;
		private static var _processInputting:*;
		private static var _stopEvent:*;

		/**
		 * 设置光标位置和选取字符。
		 * @param startIndex 光标起始位置。
		 * @param endIndex 光标结束位置。
		 */
		public function setSelection(startIndex:Number,endIndex:Number):void{}

		/**
		 * 表示是否是多行输入框。
		 */
		public var multiline:Boolean;

		/**
		 * 获取对输入框的引用实例。
		 */
		public function get nativeInput():*{
				return null;
		}
		private var _onUnDisplay:*;
		private var _onMouseDown:*;
		private static var stageMatrix:*;

		/**
		 * 在输入期间，如果 Input 实例的位置改变，调用_syncInputTransform同步输入框的位置。
		 */
		private var _syncInputTransform:*;

		/**
		 * 选中当前实例的所有文本。
		 */
		public function select():void{}

		/**
		 * 表示焦点是否在此实例上。
		 */
		public var focus:Boolean;
		private var _setInputMethod:*;
		private var _focusIn:*;
		private var _setPromptColor:*;

		/**
		 * @private 
		 */
		private var _focusOut:*;

		/**
		 * @private 
		 */
		private var _onKeyDown:*;

		/**
		 * @param text 
		 * @override 
		 */
		override public function changeText(text:String):void{}

		/**
		 * 限制输入的字符。
		 */
		public var restrict:String;

		/**
		 * 是否可编辑。
		 */
		public var editable:Boolean;

		/**
		 * <p>字符数量限制，默认为10000。</p>
		 * <p>设置字符数量限制时，小于等于0的值将会限制字符数量为10000。</p>
		 */
		public var maxChars:Number;

		/**
		 * 设置输入提示符。
		 */
		public var prompt:String;

		/**
		 * 设置输入提示符颜色。
		 */
		public var promptColor:String;

		/**
		 * <p>输入框类型为Input静态常量之一。</p>
		 * <ul>
		 * <li>TYPE_TEXT</li>
		 * <li>TYPE_PASSWORD</li>
		 * <li>TYPE_EMAIL</li>
		 * <li>TYPE_URL</li>
		 * <li>TYPE_NUMBER</li>
		 * <li>TYPE_RANGE</li>
		 * <li>TYPE_DATE</li>
		 * <li>TYPE_MONTH</li>
		 * <li>TYPE_WEEK</li>
		 * <li>TYPE_TIME</li>
		 * <li>TYPE_DATE_TIME</li>
		 * <li>TYPE_DATE_TIME_LOCAL</li>
		 * </ul>
		 * <p>平台兼容性参见http://www.w3school.com.cn/html5/html_5_form_input_types.asp。</p>
		 */
		public var type:String;
	}

}
