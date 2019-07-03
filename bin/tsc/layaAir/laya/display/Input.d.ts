import { Text } from "./Text";
/**
 * 用户输入一个或多个文本字符时后调度。
 * @eventType Event.INPUT
 * */
/**
 * 文本发生变化后调度。
 * @eventType Event.CHANGE
 * */
/**
 * 用户在输入框内敲回车键后，将会调度 <code>enter</code> 事件。
 * @eventType Event.ENTER
 * */
/**
 * 显示对象获得焦点后调度。
 * @eventType Event.FOCUS
 * */
/**
 * 显示对象失去焦点后调度。
 * @eventType Event.BLUR
 * */
/**
 * <p><code>Input</code> 类用于创建显示对象以显示和输入文本。</p>
 * <p>Input 类封装了原生的文本输入框，由于不同浏览器的差异，会导致此对象的默认文本的位置与用户点击输入时的文本的位置有少许的偏差。</p>
 */
export declare class Input extends Text {
    /** 常规文本域。*/
    static TYPE_TEXT: string;
    /** password 类型用于密码域输入。*/
    static TYPE_PASSWORD: string;
    /** email 类型用于应该包含 e-mail 地址的输入域。*/
    static TYPE_EMAIL: string;
    /** url 类型用于应该包含 URL 地址的输入域。*/
    static TYPE_URL: string;
    /** number 类型用于应该包含数值的输入域。*/
    static TYPE_NUMBER: string;
    /**
     * <p>range 类型用于应该包含一定范围内数字值的输入域。</p>
     * <p>range 类型显示为滑动条。</p>
     * <p>您还能够设定对所接受的数字的限定。</p>
     */
    static TYPE_RANGE: string;
    /**  选取日、月、年。*/
    static TYPE_DATE: string;
    /** month - 选取月、年。*/
    static TYPE_MONTH: string;
    /** week - 选取周和年。*/
    static TYPE_WEEK: string;
    /** time - 选取时间（小时和分钟）。*/
    static TYPE_TIME: string;
    /** datetime - 选取时间、日、月、年（UTC 时间）。*/
    static TYPE_DATE_TIME: string;
    /** datetime-local - 选取时间、日、月、年（本地时间）。*/
    static TYPE_DATE_TIME_LOCAL: string;
    /**
     * <p>search 类型用于搜索域，比如站点搜索或 Google 搜索。</p>
     * <p>search 域显示为常规的文本域。</p>
     */
    static TYPE_SEARCH: string;
    /**@private */
    protected static input: any;
    /**@private */
    protected static area: any;
    /**@private */
    protected static inputElement: any;
    /**@private */
    protected static inputContainer: any;
    /**@private */
    protected static confirmButton: any;
    /**@private */
    protected static promptStyleDOM: any;
    /**@private */
    protected _focus: boolean;
    /**@private */
    protected _multiline: boolean;
    /**@private */
    protected _editable: boolean;
    /**@private */
    protected _restrictPattern: any;
    /**@private */
    protected _maxChars: number;
    private _type;
    /**输入提示符。*/
    private _prompt;
    /**输入提示符颜色。*/
    private _promptColor;
    private _originColor;
    private _content;
    /**@private */
    static IOS_IFRAME: boolean;
    private static inputHeight;
    /**表示是否处于输入状态。*/
    static isInputting: boolean;
    /**创建一个新的 <code>Input</code> 类实例。*/
    constructor();
    /**@private */
    static __init__(): void;
    private static _popupInputMethod;
    private static _createInputElement;
    private static _initInput;
    private static _processInputting;
    private static _stopEvent;
    /**
     * 设置光标位置和选取字符。
     * @param	startIndex	光标起始位置。
     * @param	endIndex	光标结束位置。
     */
    setSelection(startIndex: number, endIndex: number): void;
    /**表示是否是多行输入框。*/
    multiline: boolean;
    /**
     * 获取对输入框的引用实例。
     */
    readonly nativeInput: any;
    private _onUnDisplay;
    private _onMouseDown;
    private static stageMatrix;
    /**
     * 在输入期间，如果 Input 实例的位置改变，调用_syncInputTransform同步输入框的位置。
     */
    private _syncInputTransform;
    /**选中当前实例的所有文本。*/
    select(): void;
    /**
     * 表示焦点是否在此实例上。
     */
    focus: boolean;
    private _setInputMethod;
    private _focusIn;
    private _setPromptColor;
    /**@private */
    private _focusOut;
    /**@private */
    private _onKeyDown;
    /**@inheritDoc */
    /*override*/ text: string;
    changeText(text: string): void;
    /**@inheritDoc */
    color: string;
    /**@inheritDoc */
    bgColor: string;
    /**限制输入的字符。*/
    restrict: string;
    /**
     * 是否可编辑。
     */
    editable: boolean;
    /**
     * <p>字符数量限制，默认为10000。</p>
     * <p>设置字符数量限制时，小于等于0的值将会限制字符数量为10000。</p>
     */
    maxChars: number;
    /**
     * 设置输入提示符。
     */
    prompt: string;
    /**
     * 设置输入提示符颜色。
     */
    promptColor: string;
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
    type: string;
}
