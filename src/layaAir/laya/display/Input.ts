import { Text } from "./Text";
import { Event } from "../events/Event"
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { InputManager } from "../events/InputManager";
import { Render } from "../renders/Render";
import { SpriteUtils } from "../utils/SpriteUtils";
import { SerializeUtil } from "../loaders/SerializeUtil";
/**
 * @en The Input class is used to create display objects to display and input text.
 * The Input class encapsulates the native text input box. Due to differences between browsers, there may be slight deviations between the position of the default text of this object and the position of the text when the user clicks to input.
 * - Event.INPUT: Dispatched when one or more text characters are input by the user.
 * - Event.CHANGE: Dispatched after the text has changed.
 * - Event.ENTER: Dispatched when the user presses the Enter key in the input field.
 * - Event.FOCUS: Dispatched when the display object receives focus.
 * - Event.BLUR: Dispatched when the display object loses focus.
 * @zh Input 类用于创建显示对象以显示和输入文本。
 * Input 类封装了原生的文本输入框，由于不同浏览器的差异，会导致此对象的默认文本的位置与用户点击输入时的文本的位置有少许的偏差。
 * - Event.INPUT: 当用户输入一个或多个文本字符时后调度。
 * - Event.CHANGE: 文本发生变化后调度。
 * - Event.ENTER: 用户在输入框内敲回车键后，将会调度 enter 事件。
 * - Event.FOCUS: 显示对象获得焦点后调度。
 * - Event.BLUR: 显示对象失去焦点后调度。
 */
export class Input extends Text {
    /**
     * @en Regular text field.
     * @zh 常规文本域。
     */
    static TYPE_TEXT: string = "text";
    /**
     * @en Password type for password input fields.
     * @zh password 类型用于密码域输入。
     */
    static TYPE_PASSWORD: string = "password";
    /**
     * @en Email type for input fields that should contain an e-mail address.
     * @zh email 类型用于应该包含 e-mail 地址的输入域。
     */
    static TYPE_EMAIL: string = "email";
    /**
     * @en URL type for input fields that should contain a URL address.
     * @zh url 类型用于应该包含 URL 地址的输入域。
     */
    static TYPE_URL: string = "url";
    /**
     * @en Number type for input fields that should contain a numeric value.
     * @zh number 类型用于应该包含数值的输入域。
     */
    static TYPE_NUMBER: string = "number";
    /**
     * @en Range type for input fields that should contain a numeric value within a certain range.
     * The range type is displayed as a slider.
     * You can also set limitations on the accepted numbers.
     * @zh range 类型用于应该包含一定范围内数字值的输入域。
     * range 类型显示为滑动条。
     * 您还能够设定对所接受的数字的限定。
     */
    static TYPE_RANGE: string = "range";
    /**
     * @en Select day, month, and year.
     * @zh 选取日、月、年。
     */
    static TYPE_DATE: string = "date";
    /**
     * @en Select month and year.
     * @zh month - 选取月、年。
     */
    static TYPE_MONTH: string = "month";
    /**
     * @en Select week and year.
     * @zh week - 选取周和年。
     */
    static TYPE_WEEK: string = "week";
    /**
     * @en Select time (hours and minutes).
     * @zh time - 选取时间（小时和分钟）。
     */
    static TYPE_TIME: string = "time";
    /**
     * @en Select time, day, month, year (UTC time).
     * @zh datetime - 选取时间、日、月、年（UTC 时间）。
     */
    static TYPE_DATE_TIME: string = "datetime";
    /**
     * @en Select time, day, month, year (local time).
     * @zh datetime-local - 选取时间、日、月、年（本地时间）。
     */
    static TYPE_DATE_TIME_LOCAL: string = "datetime-local";
    /**
     * @en Search type for search fields, such as site search or Google search.
     * The search field is displayed as a regular text field.
     * @zh search 类型用于搜索域，比如站点搜索或 Google 搜索。
     * search 域显示为常规的文本域。
     */
    static TYPE_SEARCH: string = "search";

    protected static input: HTMLInputElement;
    protected static area: HTMLTextAreaElement;
    protected static inputElement: HTMLInputElement | HTMLTextAreaElement;
    protected static inputContainer: HTMLDivElement;
    protected static confirmButton: any;
    protected static promptStyleDOM: any;

    protected _focus: boolean;
    protected _multiline: boolean = false;
    protected _editable: boolean = true;
    protected _restrict: string;
    protected _restrictPattern: any;
    protected _maxChars: number = 0;

    private _type: string = "text";

    /**
     * @en Indicates whether the application is running in an iframe on iOS.
     * @zh 指示应用程序是否在iOS的iframe中运行。
     */
    static IOS_IFRAME: boolean = false;

    /**
     * @en Indicates whether the application uses the new input method.
     * @zh 指示应用程序是否使用新的输入方法。
     */
    static isAppUseNewInput: boolean = false;

    constructor() {
        super();
        Input.IOS_IFRAME = (ILaya.Browser.onIOS && ILaya.Browser.window.top != ILaya.Browser.window.self);
        this._width = 100;
        this._height = 20;

        this.multiline = false;
        this.overflow = Text.SCROLL;
        this._promptColor = "#A9A9A9";

        this.on(Event.MOUSE_DOWN, this, this._onMouseDown);
        this.on(Event.UNDISPLAY, this, this._onUnDisplay);
    }

    /**@internal */
    static __init__(): void {
        Input._createInputElement();

        // 移动端通过画布的touchend调用focus
        if (ILaya.Browser.onMobile) {
            var isTrue: boolean = false;
            if (ILaya.Browser.onMiniGame || ILaya.Browser.onBDMiniGame || ILaya.Browser.onQGMiniGame || ILaya.Browser.onKGMiniGame || ILaya.Browser.onVVMiniGame || ILaya.Browser.onAlipayMiniGame || ILaya.Browser.onQQMiniGame || ILaya.Browser.onBLMiniGame || ILaya.Browser.onTTMiniGame || ILaya.Browser.onHWMiniGame || ILaya.Browser.onTBMiniGame) {
                isTrue = true;
            }
            Render.canvas.addEventListener(Input.IOS_IFRAME ? (isTrue ? "touchend" : "click") : "touchend", Input._popupInputMethod);
        }
    }

    /**
     * @en Pop up the input method on mobile platforms after clicking the event.
     * @zh 移动平台单击事件触发后弹出输入法。
     */
    private static _popupInputMethod(e: any): void {
        //e.preventDefault();
        if (!InputManager.isTextInputting) return;

        var input: any = Input.inputElement;

        // 弹出输入法。
        input.focus();
    }

    private static _createInputElement(): void {
        Input._initInput(Input.area = ILaya.Browser.createElement("textarea"));
        Input._initInput(Input.input = ILaya.Browser.createElement("input"));

        Input.inputContainer = ILaya.Browser.createElement("div");
        Input.inputContainer.style.position = "absolute";
        Input.inputContainer.style.zIndex = '1E5';
        ILaya.Browser.container.appendChild(Input.inputContainer);
        (Input.inputContainer as any).setPos = function (x: number, y: number): void {
            Input.inputContainer.style.left = x + 'px';
            Input.inputContainer.style.top = y + 'px';
        };
    }

    private static _initInput(input: HTMLInputElement): void {
        var style = input.style;
        style.cssText = "position:absolute;overflow:hidden;resize:none;transform-origin:0 0;-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-o-transform-origin:0 0;";
        style.resize = 'none';
        style.backgroundColor = 'transparent';
        style.border = 'none';
        style.outline = 'none';
        style.zIndex = '1';

        input.addEventListener('input', Input._processInputting);

        input.addEventListener('mousemove', Input._stopEvent, { passive: false });
        input.addEventListener('mousedown', Input._stopEvent, { passive: false });
        input.addEventListener('touchmove', Input._stopEvent, { passive: false });

        (input as any).setFontFace = function (fontFace: string): void { input.style.fontFamily = fontFace; };
        if (!(LayaEnv.isConch && !Input.isAppUseNewInput)) {
            (input as any).setColor = function (color: string): void { input.style.color = color; };
            (input as any).setFontSize = function (fontSize: number): void { input.style.fontSize = fontSize + 'px'; };
        }
    }

    private static _processInputting(e: any): void {
        var input: Input = (Input.inputElement as any).target;
        if (!input) return;

        var value = Input.inputElement.value;

        // 对输入字符进行限制
        if (input._restrictPattern) {
            // 部分输入法兼容
            value = value.replace(/\u2006|\x27/g, "");

            if (input._restrictPattern.test(value)) {
                value = value.replace(input._restrictPattern, "");
                Input.inputElement.value = value;
            }
        }

        if (value == null) value = "";
        input._text = value;
        input.event(Event.INPUT);
    }

    private static _stopEvent(e: any): void {
        if (e.type == 'touchmove')
            e.preventDefault();
        e.stopPropagation && e.stopPropagation();
    }

    /**
     * @en Set the cursor position and select characters.
     * @param startIndex The starting position of the cursor.
     * @param endIndex The ending position of the cursor.
     * @zh 设置光标位置和选取字符。
     * @param startIndex 光标起始位置。
     * @param endIndex 光标结束位置。
     */
    setSelection(startIndex: number, endIndex: number): void {
        this.focus = true;
        Input.inputElement.selectionStart = startIndex;
        Input.inputElement.selectionEnd = endIndex;
    }

    /**
     * @en Whether it's a multi-line input box.
     * @zh 是否是多行输入框。
     */
    get multiline(): boolean {
        return this._multiline;
    }

    set multiline(value: boolean) {
        this._multiline = value;
        if (!SerializeUtil.isDeserializing)
            this.valign = value ? "top" : "middle";
    }

    /**
     * @en Reference instance to input box
     * @zh 对输入框的引用实例。
     */
    get nativeInput(): HTMLInputElement | HTMLTextAreaElement {
        return this._multiline ? Input.area : Input.input;
    }

    private _onUnDisplay(e: Event = null): void {
        this.focus = false;
    }

    private _onMouseDown(e: Event): void {
        this.focus = true;
    }
    /**
     * @en Sync the position of the input box when the Input instance changes during input.
     * @zh 在输入期间，如果 Input 实例的位置改变，调用_syncInputTransform同步输入框的位置。
     */
    private _syncInputTransform(): void {
        var inputElement = this.nativeInput;
        var transform = SpriteUtils.getTransformRelativeToWindow(this, this._padding[3], this._padding[0]);
        var inputWid = this._width - this._padding[1] - this._padding[3];
        var inputHei = this._height - this._padding[0] - this._padding[2];
        if (LayaEnv.isConch && !Input.isAppUseNewInput) {
            (inputElement as any).setScale(transform.scaleX, transform.scaleY);
            (inputElement as any).setSize(inputWid, inputHei);
            (inputElement as any).setPos(transform.x, transform.y);
        } else {
            Input.inputContainer.style.transform = Input.inputContainer.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)";
            inputElement.style.width = inputWid + 'px';
            inputElement.style.height = inputHei + 'px';
            Input.inputContainer.style.left = transform.x + 'px';
            Input.inputContainer.style.top = transform.y + 'px';
        }
    }

    /**
     * @en Selects all the text in the current instance.
     * @zh 选中当前实例的所有文本。
     */
    select(): void {
        this.nativeInput.select();
    }

    /**
     * @en Whether the focus is on this instance.
     * Note: On mobile platforms, the keyboard may not immediately pop up when calling the focus interface.
     * On mobile platforms, focus is usually triggered by clicking on the canvas.
     * @zh 焦点是否在此实例上。
     * 注意：在移动平台上，调用 focus 接口可能无法立即弹出键盘。
     * 移动平台上通常是点击画布才会触发焦点。
     */
    get focus(): boolean {
        return this._focus;
    }

    set focus(value: boolean) {
        var input = this.nativeInput;

        if (this._focus !== value) {
            if (value) {
                if ((input as any).target) {
                    (input as any).target._focusOut();
                } else {
                    this._setInputMethod();
                }
                input = this.nativeInput;
                (input as any).target = this;
                this._focusIn();
            } else {
                (input as any).target = null;
                this._focusOut();
                ILaya.Browser.document.body.scrollTop = 0;
                input.blur();

                if (LayaEnv.isConch && !Input.isAppUseNewInput) (input as any).setPos(-10000, -10000);
                else if (Input.inputContainer.contains(input)) Input.inputContainer.removeChild(input);
            }
        }
    }

    private _setInputMethod(): void {
        Input.input.parentElement && (Input.inputContainer.removeChild(Input.input));
        Input.area.parentElement && (Input.inputContainer.removeChild(Input.area));

        // 安卓的安全键盘的问题；
        // 如果设置type='password' 则会弹安全键盘
        // 就算以后设置type='text' 还是会弹安全键盘，所以对于安卓，干脆全部重新生成
        if (ILaya.Browser.onAndroid) {
            Input.input = Input.inputElement = ILaya.Browser.createElement('input');
            Input._initInput(Input.input);
        }

        Input.inputElement = (this._multiline ? Input.area : Input.input);
        Input.inputContainer.appendChild(Input.inputElement);
        if (Text.RightToLeft) {
            Input.inputElement.style.direction = "rtl";
        }
    }

    private _focusIn(): void {
        InputManager.isTextInputting = true;
        var input = this.nativeInput;

        Input.input && (Input.input.type = this._type);		// 设置input控件的 password

        this._focus = true;

        var cssStyle = input.style;
        cssStyle.whiteSpace = (this.wordWrap ? "pre-wrap" : "nowrap");
        this._setPromptColor();

        input.readOnly = !this._editable;
        if (LayaEnv.isConch && !Input.isAppUseNewInput) {
            (input as any).setType(this._type);
            (input as any).setForbidEdit(!this._editable);
        }
        input.maxLength = this._maxChars <= 0 ? 1E5 : this._maxChars;

        input.value = this._text;
        input.placeholder = this._prompt;

        ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.on(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.focus = this;
        this.event(Event.FOCUS);

        // PC端直接调用focus进入焦点。
        if (ILaya.Browser.onPC) input.focus();

        // PC浏览器隐藏文字
        if (!(LayaEnv.isConch && Input.isAppUseNewInput) && !ILaya.Browser.onMiniGame && !ILaya.Browser.onBDMiniGame && !ILaya.Browser.onQGMiniGame && !ILaya.Browser.onKGMiniGame && !ILaya.Browser.onVVMiniGame && !ILaya.Browser.onAlipayMiniGame && !ILaya.Browser.onQQMiniGame && !ILaya.Browser.onBLMiniGame && !ILaya.Browser.onTTMiniGame && !ILaya.Browser.onHWMiniGame && !ILaya.Browser.onTBMiniGame) {
            this.graphics.clear(true);
            this.drawBg();
            this._hideText = true;
        }

        // PC同步输入框外观。
        (input as any).setColor(this.color);
        (input as any).setFontSize(this.fontSize);
        (input as any).setFontFace(this._realFont);
        if (LayaEnv.isConch && !Input.isAppUseNewInput) {
            (input as any).setMultiAble && (input as any).setMultiAble(this._multiline);
        }
        cssStyle.lineHeight = (this.leading + this.fontSize) + "px";
        cssStyle.fontStyle = (this.italic ? "italic" : "normal");
        cssStyle.fontWeight = (this.bold ? "bold" : "normal");
        cssStyle.textAlign = this.align;
        cssStyle.padding = "0 0";

        // 输入框重定位。
        this._syncInputTransform();
        if (!LayaEnv.isConch && ILaya.Browser.onPC)
            ILaya.systemTimer.frameLoop(1, this, this._syncInputTransform);
    }

    /**
     * @en Set the prompt color of DOM input box.
     * @zh 设置DOM输入框提示符颜色。
     */
    private _setPromptColor(): void {
        // 创建style标签
        Input.promptStyleDOM = ILaya.Browser.getElementById("promptStyle");
        if (!Input.promptStyleDOM) {
            Input.promptStyleDOM = ILaya.Browser.createElement("style");
            Input.promptStyleDOM.setAttribute("id", "promptStyle");
            ILaya.Browser.document.head.appendChild(Input.promptStyleDOM);
        }

        // 设置style标签
        Input.promptStyleDOM.innerText = "input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {" + "color:" + this._promptColor + "}" + "input:-moz-placeholder, textarea:-moz-placeholder {" + "color:" + this._promptColor + "}" + "input::-moz-placeholder, textarea::-moz-placeholder {" + "color:" + this._promptColor + "}" + "input:-ms-input-placeholder, textarea:-ms-input-placeholder {" + "color:" + this._promptColor + "}";
    }

    private _focusOut(): void {
        if (!InputManager.isTextInputting) return;
        if (!InputManager.isiOSWKwebView)
            InputManager.isTextInputting = false;
        this._focus = false;
        this._hideText = false;

        this.text = this.nativeInput.value;
        this.markChanged();
        this.typeset();

        ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.focus = null;
        this.event(Event.BLUR);
        this.event(Event.CHANGE);
        if (LayaEnv.isConch && !Input.isAppUseNewInput) this.nativeInput.blur();
        // 只有PC会注册此事件。
        ILaya.Browser.onPC && ILaya.systemTimer.clear(this, this._syncInputTransform);
    }

    private _onKeyDown(e: any): void {
        if (e.keyCode === 13) {
            // 移动平台单行输入状态下点击回车收回输入法。 
            if (ILaya.Browser.onMobile && !this._multiline)
                this.focus = false;

            this.event(Event.ENTER);
        }
    }

    /**
     * @en Specifically for mini-games (resolves the issue of content inconsistency between keyboard input box and game input box).
     * @param value The text value to be synchronized.
     * @zh 小游戏专用（解决键盘输入框内容和游戏输入框内容不同步的问题）。
     * @param value 需要同步的文本值。
     */
    miniGameTxt(value: string) {
        value += '';
        if (!this._multiline)
            value = value.replace(/\r?\n/g, '');
        this.text = value;
    }

    /**
     * @en The text content of the input field.
     * @zh 输入框的文本内容。
     */
    get text(): string {
        if (this._focus)
            return this.nativeInput.value;
        else
            return super.text;
    }

    set text(value: string) {
        if (value == null)
            value = "";
        else if (typeof (value) !== "string")
            value = '' + value;

        if (this._focus) {
            this.nativeInput.value = value;
            this.event(Event.CHANGE);
        } else {
            // 单行时不允许换行
            if (!this._multiline)
                value = value.replace(/\r?\n/g, '');

            super.text = value;
        }
    }

    /**
     * @en Set the color of the input text.
     * @zh 设置输入文本的颜色。
     */
    set_color(value: string) {
        if (this._focus)
            (this.nativeInput as any).setColor(value);

        super.set_color(value);
    }

    /**
     * @en The background color of the input text.
     * @zh 输入文本的背景颜色。
     */
    get bgColor() {
        return super.bgColor;
    }

    set bgColor(value: string) {
        super.bgColor = value;
        if (LayaEnv.isConch && !Input.isAppUseNewInput)
            (this.nativeInput as any).setBgColor(value);
    }

    /**
     * @en The restriction on input characters.
     * @zh 对输入字符的限制。
     */
    get restrict(): string {
        return this._restrict;
    }

    set restrict(value: string) {
        this._restrict = value;
        // H5保存RegExp
        if (value) {
            value = "[^" + value + "]";

            // 如果pattern为^\00-\FF，则我们需要的正则表达式是\00-\FF
            if (value.indexOf("^^") > -1)
                value = value.replace("^^", "");

            this._restrictPattern = new RegExp(value, "g");
        } else
            this._restrictPattern = null;
    }

    /**
     * @en Whether the input text is editable.
     * @zh 输入框文本是否可编辑。
     */
    get editable(): boolean {
        return this._editable;
    }

    set editable(value: boolean) {
        this._editable = value;
        if (LayaEnv.isConch && !Input.isAppUseNewInput) {
            (Input.input as any).setForbidEdit(!value);
        }
    }

    /**
     * @en The maximum number of characters allowed in the input field. Default is 10000.
     * When setting the character limit, values less than or equal to 0 will set the limit to 10000.
     * @zh 输入框允许的最大字符数量，默认为10000。
     * 设置字符数量限制时，小于等于0的值将会限制字符数量为10000。
     */
    get maxChars(): number {
        return this._maxChars;
    }

    set maxChars(value: number) {
        this._maxChars = value;
    }

    /**
     * @en The prompt text for the input field.
     * @zh 输入框的提示文本。
     */
    get prompt(): string {
        return this._prompt;
    }

    set prompt(value: string) {
        value = Text.langPacks?.[value] || value;
        if (this._prompt != value) {
            this._prompt = value;
            this.markChanged();
        }
    }

    /**
     * @en Enter the prompt color.
     * @zh 输入提示文本的颜色。
     */
    get promptColor(): string {
        return this._promptColor;
    }

    set promptColor(value: string) {
        if (this._promptColor != value) {
            this._promptColor = value;
            this.markChanged();
        }
    }

    /**
     * @en The input field type, which should be one of the Input static constants.
     * Available types include:
     * - TYPE_TEXT
     * - TYPE_PASSWORD
     * - TYPE_EMAIL
     * - TYPE_URL
     * - TYPE_NUMBER
     * - TYPE_RANGE
     * - TYPE_DATE
     * - TYPE_MONTH
     * - TYPE_WEEK
     * - TYPE_TIME
     * - TYPE_DATE_TIME
     * - TYPE_DATE_TIME_LOCAL
     * For platform compatibility, please refer to: http://www.w3school.com.cn/html5/html_5_form_input_types.asp
     * @zh 输入框类型，应为 Input 静态常量之一。
     * 常用类型包括：
     * - TYPE_TEXT
     * - TYPE_PASSWORD
     * - TYPE_EMAIL
     * - TYPE_URL
     * - TYPE_NUMBER
     * - TYPE_RANGE
     * - TYPE_DATE
     * - TYPE_MONTH
     * - TYPE_WEEK
     * - TYPE_TIME
     * - TYPE_DATE_TIME
     * - TYPE_DATE_TIME_LOCAL
     * @zh 平台兼容性请参考：http://www.w3school.com.cn/html5/html_5_form_input_types.asp
     */
    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._asPassword = value === "password";
        this._type = value;
        this.markChanged();
    }
}