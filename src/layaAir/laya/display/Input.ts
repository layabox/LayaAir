import { Text } from "./Text";
import { Event } from "../events/Event"
import { PAL } from "../platform/PlatformAdapters";

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
    static readonly TYPE_TEXT: string = "text";
    /**
     * @en Password type for password input fields.
     * @zh password 类型用于密码域输入。
     */
    static readonly TYPE_PASSWORD: string = "password";
    /**
     * @en Email type for input fields that should contain an e-mail address.
     * @zh email 类型用于应该包含 e-mail 地址的输入域。
     */
    static readonly TYPE_EMAIL: string = "email";
    /**
     * @en URL type for input fields that should contain a URL address.
     * @zh url 类型用于应该包含 URL 地址的输入域。
     */
    static readonly TYPE_URL: string = "url";
    /**
     * @en Number type for input fields that should contain a numeric value.
     * @zh number 类型用于应该包含数值的输入域。
     */
    static readonly TYPE_NUMBER: string = "number";
    /**
     * @en Range type for input fields that should contain a numeric value within a certain range.
     * The range type is displayed as a slider.
     * You can also set limitations on the accepted numbers.
     * @zh range 类型用于应该包含一定范围内数字值的输入域。
     * range 类型显示为滑动条。
     * 您还能够设定对所接受的数字的限定。
     */
    static readonly TYPE_RANGE: string = "range";
    /**
     * @en Select day, month, and year.
     * @zh 选取日、月、年。
     */
    static readonly TYPE_DATE: string = "date";
    /**
     * @en Select month and year.
     * @zh month - 选取月、年。
     */
    static readonly TYPE_MONTH: string = "month";
    /**
     * @en Select week and year.
     * @zh week - 选取周和年。
     */
    static readonly TYPE_WEEK: string = "week";
    /**
     * @en Select time (hours and minutes).
     * @zh time - 选取时间（小时和分钟）。
     */
    static readonly TYPE_TIME: string = "time";
    /**
     * @en Select time, day, month, year (UTC time).
     * @zh datetime - 选取时间、日、月、年（UTC 时间）。
     */
    static readonly TYPE_DATE_TIME: string = "datetime";
    /**
     * @en Select time, day, month, year (local time).
     * @zh datetime-local - 选取时间、日、月、年（本地时间）。
     */
    static readonly TYPE_DATE_TIME_LOCAL: string = "datetime-local";
    /**
     * @en Search type for search fields, such as site search or Google search.
     * The search field is displayed as a regular text field.
     * @zh search 类型用于搜索域，比如站点搜索或 Google 搜索。
     * search 域显示为常规的文本域。
     */
    static readonly TYPE_SEARCH: string = "search";

    /**
     * @en The type of the confirm button on the keyboard.
     * @zh 键盘上确认按钮的类型。
     */
    confirmType: 'done' | 'next' | 'search' | 'go' | 'send' = 'done';

    /**
     * @en The maximum number of characters allowed in the input field. Default is 10000.
     * When setting the character limit, values less than or equal to 0 will set the limit to 10000.
     * @zh 输入框允许的最大字符数量，默认为10000。
     * 设置字符数量限制时，小于等于0的值将会限制字符数量为10000。
     */
    maxChars: number = 0;

    /**
     * @en The restriction on input characters.
     * @zh 对输入字符的限制。
     */
    restrict: string;

    protected _multiline: boolean = false;
    protected _editable: boolean = true;
    protected _type: string;

    constructor() {
        super();

        this._width = 100;
        this._height = 20;
        this._type = "text";
        this._promptColor = "#a9a9a9";
        this.overflow = Text.SCROLL;
        this.valign = "middle";
        this.mouseEnabled = true;
    }

    /**
     * @en Whether it's a multi-line input box.
     * @zh 是否是多行输入框。
     */
    get multiline(): boolean {
        return this._multiline;
    }

    set multiline(value: boolean) {
        if (this._multiline != value) {
            this._multiline = value;
            this.wordWrap = value;
            this.valign = value ? "top" : "middle";
        }
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
        return PAL.textInput.target === this;
    }

    set focus(value: boolean) {
        if (value)
            PAL.textInput.begin(this);
        else if (this === PAL.textInput.target)
            PAL.textInput.end();
    }

    /**
     * @en The text content of the input field.
     * @zh 输入框的文本内容。
     */
    get text(): string {
        if (PAL.textInput.target === this)
            PAL.textInput.syncText();
        return super.text;
    }

    set text(value: string) {
        if (value == null)
            value = "";
        else if (typeof (value) !== "string")
            value = '' + value;

        if (PAL.textInput.target === this) {
            PAL.textInput.setText(value);
            this.event(Event.CHANGE);
        } else {
            // 单行时不允许换行
            if (!this._multiline)
                value = value.replace(/\r?\n/g, '');

            super.text = value;
        }
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
    }

    /**
     * @en The prompt text for the input field.
     * @zh 输入框的提示文本。
     */
    get prompt(): string {
        return this._prompt;
    }

    set prompt(value: string) {
        if (value == null)
            value = "";

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
        PAL.textInput.setSelection(startIndex, endIndex);
    }

    /**
     * @en Selects all the text in the current instance.
     * @zh 选中当前实例的所有文本。
     */
    select(): void {
        this.focus = true;
        PAL.textInput.setSelection(0, -1);
    }
}