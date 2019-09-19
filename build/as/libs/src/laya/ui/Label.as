package laya.ui {
	import laya.display.Text;
	import laya.ui.UIComponent;

	/**
	 * 文本内容发生改变后调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * <p> <code>Label</code> 类用于创建显示对象以显示文本。</p>
	 * @example <caption>以下示例代码，创建了一个 <code>Label</code> 实例。</caption>package{import laya.ui.Label;public class Label_Example{public function Label_Example(){Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。onInit();}private function onInit():void{var label:Label = new Label();//创建一个 Label 类的实例对象 label 。label.font = "Arial";//设置 label 的字体。label.bold = true;//设置 label 显示为粗体。label.leading = 4;//设置 label 的行间距。label.wordWrap = true;//设置 label 自动换行。label.padding = "10,10,10,10";//设置 label 的边距。label.color = "#ff00ff";//设置 label 的颜色。label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。label.width = 300;//设置 label 的宽度。label.height = 200;//设置 label 的高度。Laya.stage.addChild(label);//将 label 添加到显示列表。var passwordLabel:Label = new Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。passwordLabel.width = 300;//设置 passwordLabel 的宽度。passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。}}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高Laya.stage.bgColor = "#efefef";//设置画布的背景颜色onInit();function onInit(){    var label = new laya.ui.Label();//创建一个 Label 类的实例对象 label 。    label.font = "Arial";//设置 label 的字体。    label.bold = true;//设置 label 显示为粗体。    label.leading = 4;//设置 label 的行间距。    label.wordWrap = true;//设置 label 自动换行。    label.padding = "10,10,10,10";//设置 label 的边距。    label.color = "#ff00ff";//设置 label 的颜色。    label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。    label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。    label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。    label.width = 300;//设置 label 的宽度。    label.height = 200;//设置 label 的高度。    Laya.stage.addChild(label);//将 label 添加到显示列表。    var passwordLabel = new laya.ui.Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。    passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。    passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。    passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。    passwordLabel.width = 300;//设置 passwordLabel 的宽度。    passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。    passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。    passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。    Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。}
	 * @example import Label = laya.ui.Label;class Label_Example {    constructor() {        Laya.init(640, 800);//设置游戏画布宽高。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        this.onInit();    }    private onInit(): void {        var label: Label = new Label();//创建一个 Label 类的实例对象 label 。        label.font = "Arial";//设置 label 的字体。        label.bold = true;//设置 label 显示为粗体。        label.leading = 4;//设置 label 的行间距。        label.wordWrap = true;//设置 label 自动换行。        label.padding = "10,10,10,10";//设置 label 的边距。        label.color = "#ff00ff";//设置 label 的颜色。        label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。        label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。        label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。        label.width = 300;//设置 label 的宽度。        label.height = 200;//设置 label 的高度。        Laya.stage.addChild(label);//将 label 添加到显示列表。        var passwordLabel: Label = new Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。        passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。        passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。        passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。        passwordLabel.width = 300;//设置 passwordLabel 的宽度。        passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。        passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。        passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。        Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。    }}
	 * @see laya.display.Text
	 */
	public class Label extends UIComponent {

		/**
		 * @private 文本 <code>Text</code> 实例。
		 */
		protected var _tf:Text;

		/**
		 * 创建一个新的 <code>Label</code> 实例。
		 * @param text 文本内容字符串。
		 */

		public function Label(text:String = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @override 
		 * @inheritDoc 
		 */
		override protected function createChildren():void{}

		/**
		 * 当前文本内容字符串。
		 * @see laya.display.Text.text
		 */
		public var text:String;

		/**
		 * @copy laya.display.Text#changeText()
		 */
		public function changeText(text:String):void{}

		/**
		 * @copy laya.display.Text#wordWrap
		 */

		/**
		 * @copy laya.display.Text#wordWrap
		 */
		public var wordWrap:Boolean;

		/**
		 * @copy laya.display.Text#color
		 */
		public var color:String;

		/**
		 * @copy laya.display.Text#font
		 */
		public var font:String;

		/**
		 * @copy laya.display.Text#align
		 */
		public var align:String;

		/**
		 * @copy laya.display.Text#valign
		 */
		public var valign:String;

		/**
		 * @copy laya.display.Text#bold
		 */
		public var bold:Boolean;

		/**
		 * @copy laya.display.Text#italic
		 */
		public var italic:Boolean;

		/**
		 * @copy laya.display.Text#leading
		 */
		public var leading:Number;

		/**
		 * @copy laya.display.Text#fontSize
		 */
		public var fontSize:Number;

		/**
		 * <p>边距信息</p>
		 * <p>"上边距，右边距，下边距 , 左边距（边距以像素为单位）"</p>
		 * @see laya.display.Text.padding
		 */
		public var padding:String;

		/**
		 * @copy laya.display.Text#bgColor
		 */
		public var bgColor:String;

		/**
		 * @copy laya.display.Text#borderColor
		 */
		public var borderColor:String;

		/**
		 * @copy laya.display.Text#stroke
		 */
		public var stroke:Number;

		/**
		 * @copy laya.display.Text#strokeColor
		 */
		public var strokeColor:String;

		/**
		 * 文本控件实体 <code>Text</code> 实例。
		 */
		public function get textField():Text{
				return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function measureWidth():Number{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function measureHeight():Number{
			return null;
		}

		/**
		 * @copy laya.display.Text#overflow
		 */

		/**
		 * @copy laya.display.Text#overflow
		 */
		public var overflow:String;

		/**
		 * @copy laya.display.Text#underline
		 */

		/**
		 * @copy laya.display.Text#underline
		 */
		public var underline:Boolean;

		/**
		 * @copy laya.display.Text#underlineColor
		 */

		/**
		 * @copy laya.display.Text#underlineColor
		 */
		public var underlineColor:String;
	}

}
